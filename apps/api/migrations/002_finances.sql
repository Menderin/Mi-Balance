-- Unscaled NUMERIC + CHECK rejects fractional pesos rather than rounding them.
CREATE DOMAIN clp_amount AS numeric
  CHECK (VALUE = trunc(VALUE) AND abs(VALUE) <= 9007199254740991);

CREATE TABLE financial_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE REFERENCES "user"(id),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  initial_balance clp_amount NOT NULL,
  start_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Santiago')::date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  UNIQUE (id, type),
  UNIQUE (name, type)
);
INSERT INTO categories (id, name, type) VALUES
 ('food', 'Alimentación', 'expense'), ('transport', 'Transporte', 'expense'),
 ('hardware', 'Hardware', 'expense'), ('university', 'Universidad', 'expense'),
 ('entertainment', 'Entretenimiento', 'expense'), ('services', 'Servicios', 'expense'),
 ('home', 'Hogar', 'expense'), ('health', 'Salud', 'expense'),
 ('clothing', 'Ropa', 'expense'), ('other-expense', 'Otros', 'expense'),
 ('salary', 'Sueldo', 'income'), ('freelance', 'Trabajo independiente', 'income'),
 ('gift', 'Regalo', 'income'), ('other-income', 'Otros', 'income');

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES financial_accounts(id),
  type text NOT NULL CHECK (type IN ('income', 'expense', 'refund')),
  amount clp_amount NOT NULL CHECK (amount > 0),
  description text NOT NULL CHECK (length(btrim(description)) BETWEEN 1 AND 500),
  category_id text,
  category_type text,
  occurred_on date NOT NULL,
  original_expense_id uuid,
  deleted_at timestamptz,
  deletion_batch_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, account_id),
  FOREIGN KEY (category_id, category_type) REFERENCES categories(id, type),
  FOREIGN KEY (original_expense_id, account_id) REFERENCES transactions(id, account_id) DEFERRABLE INITIALLY DEFERRED,
  CHECK (original_expense_id IS NULL OR original_expense_id <> id),
  CHECK (
    (type = 'refund' AND original_expense_id IS NOT NULL AND category_id IS NULL AND category_type IS NULL)
    OR (type IN ('income', 'expense') AND original_expense_id IS NULL AND category_id IS NOT NULL AND category_type IS NOT NULL AND category_type = type)
  ),
  CHECK ((deleted_at IS NULL) = (deletion_batch_id IS NULL))
);
CREATE INDEX transactions_account_date_idx ON transactions(account_id, occurred_on DESC, id);
CREATE INDEX transactions_refund_idx ON transactions(original_expense_id) WHERE original_expense_id IS NOT NULL;
CREATE INDEX transactions_trash_idx ON transactions(account_id, deletion_batch_id) WHERE deleted_at IS NOT NULL;

-- Serialize financial writes per account so concurrent refunds cannot overrun a purchase.
CREATE FUNCTION lock_transaction_account() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.account_id <> OLD.account_id OR NEW.id <> OLD.id) THEN
    RAISE EXCEPTION 'Transaction identity and account cannot change' USING ERRCODE = '23514';
  END IF;
  PERFORM id FROM financial_accounts WHERE id = COALESCE(NEW.account_id, OLD.account_id) FOR UPDATE;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER transactions_account_lock BEFORE INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION lock_transaction_account();

-- Deferred checks allow a purchase and its refunds to be trashed/restored atomically.
CREATE FUNCTION validate_financial_account(target uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE account_start date;
BEGIN
  SELECT start_date INTO account_start FROM financial_accounts WHERE id = target;
  IF NOT FOUND THEN RETURN; END IF;
  IF account_start > (now() AT TIME ZONE 'America/Santiago')::date OR EXISTS (
    SELECT 1 FROM transactions WHERE account_id = target AND
      (occurred_on < account_start OR occurred_on > (now() AT TIME ZONE 'America/Santiago')::date)
  ) THEN
    RAISE EXCEPTION 'Dates outside account history' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM transactions r JOIN transactions e ON e.id = r.original_expense_id
    WHERE r.account_id = target AND (e.type <> 'expense' OR r.occurred_on < e.occurred_on
      OR (r.deleted_at IS NULL AND e.deleted_at IS NOT NULL))
  ) THEN
    RAISE EXCEPTION 'Invalid refund relationship or date' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM transactions e JOIN transactions r ON r.original_expense_id = e.id
    WHERE e.account_id = target AND r.deleted_at IS NULL GROUP BY e.id, e.amount
    HAVING sum(r.amount) > e.amount
  ) THEN
    RAISE EXCEPTION 'Refunds exceed purchase amount' USING ERRCODE = '23514';
  END IF;
END;
$$;
CREATE FUNCTION check_transaction_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_financial_account(COALESCE(NEW.account_id, OLD.account_id));
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER transactions_history_check AFTER INSERT OR UPDATE OR DELETE ON transactions
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_transaction_history();
CREATE FUNCTION check_account_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_financial_account(NEW.id);
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER financial_accounts_history_check AFTER INSERT OR UPDATE ON financial_accounts
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_account_history();

CREATE VIEW financial_balances AS
 SELECT a.id AS account_id, a.user_id,
   a.initial_balance + COALESCE(sum(CASE WHEN t.type = 'expense' THEN -t.amount ELSE t.amount END), 0) AS balance
 FROM financial_accounts a LEFT JOIN transactions t ON t.account_id = a.id AND t.deleted_at IS NULL
 GROUP BY a.id;
