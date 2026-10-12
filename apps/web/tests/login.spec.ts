import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const captureDirectory = "apps/web/.impeccable/review";
async function setup(page: Page, random = 0.1) {
  await page.addInitScript((value) => {
    Math.random = () => value;
  }, random);
  await page.route("**/api/me", (route) =>
    route.fulfill({ status: 401, json: {} }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

test("access links navigate to real landing and invitation information", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await setup(page);
  let submissions = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") submissions++;
  });
  await page.getByRole("link", { name: "Volver al inicio" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(
    page.getByRole("heading", { name: "Tu dinero, más claro." }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${captureDirectory}/landing-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("link", { name: "Iniciar sesión", exact: true }),
  ).toBeInViewport();
  await page.screenshot({
    path: `${captureDirectory}/landing-mobile.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("link", { name: "Iniciar sesión", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bienvenido de nuevo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Regístrate aquí" }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Regístrate aquí" }).click();
  await expect(page).toHaveURL(/\/registro$/);
  await expect(
    page.getByText("El registro por invitación aún está en preparación."),
  ).toBeVisible();
  await expect(page.locator("input")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${captureDirectory}/registration-mobile.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({
    path: `${captureDirectory}/registration-desktop.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  expect(submissions).toBe(0);
});

test("visibility preserves text, never submits, and resets between screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  let requests = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") requests++;
  });
  const input = page.getByLabel("Contraseña", { exact: true });
  await input.fill("Only-a-UI-fixture-123");
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .click();
  await expect(input).toHaveAttribute("type", "text");
  await expect(input).toHaveValue("Only-a-UI-fixture-123");
  await expect(page.locator(".balance-scene")).toBeVisible();
  await mkdir(captureDirectory, { recursive: true });
  await page.screenshot({
    path: `${captureDirectory}/desktop-covered.png`,
    fullPage: true,
    animations: "disabled",
  });
  const theme = await page.locator(".app-shell").getAttribute("data-theme");
  await page
    .getByRole("button", { name: "pulsa aquí para recuperarla" })
    .click();
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-theme",
    theme!,
  );
  await page
    .getByRole("button", { name: "Volver al inicio de sesión" })
    .click();
  await expect(input).toHaveAttribute("type", "password");
  await expect(input).toHaveValue("");
  expect(requests).toBe(0);
});

test("recovery fields toggle independently; keyboard does not submit", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/recuperar?token=ui-test-only");
  await expect(
    page.getByRole("heading", { name: "Nueva contraseña" }),
  ).toBeVisible();
  let submissions = 0;
  await page.route("**/api/auth/reset-password", async (route) => {
    submissions++;
    await route.fulfill({ status: 200, json: { status: true } });
  });
  await page.locator("#password").fill("UI-new-password-123");
  await page
    .getByLabel("Confirma tu contraseña", { exact: true })
    .fill("UI-new-password-123");
  const show = page.getByRole("button", {
    name: "Mostrar nueva contraseña",
    exact: true,
  });
  await show.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page
    .getByRole("button", {
      name: "Mostrar confirma tu contraseña",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Ocultar nueva contraseña", exact: true })
    .click();
  await expect(page.locator("#password")).toHaveAttribute("type", "password");
  await expect(
    page.getByLabel("Confirma tu contraseña", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page
    .getByRole("button", {
      name: "Ocultar confirma tu contraseña",
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel("Confirma tu contraseña", { exact: true }),
  ).toHaveAttribute("type", "password");
  expect(submissions).toBe(0);
  await page.getByRole("button", { name: "Guardar contraseña" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Contraseña actualizada",
  );
  expect(submissions).toBe(1);
});

test("errors and loading remain functional", async ({ page }) => {
  await setup(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/auth/sign-in/email", async (route) => {
    await gate;
    await route.fulfill({ status: 401, json: {} });
  });
  await page.getByLabel("Correo electrónico").fill("ui@example.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("Only-a-test-123");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Procesando…" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Mostrar contraseña", exact: true }),
  ).toBeDisabled();
  release();
  await expect(page.getByRole("alert")).toContainText(
    "Revisa tu correo y contraseña",
  );
});

test("login and logout keep the welcome flow and reset visibility", async ({
  page,
}) => {
  await setup(page);
  let authenticated = false;
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: authenticated ? 200 : 401,
      json: authenticated
        ? { user: { name: "Ana", email: "ana@example.test" } }
        : {},
    }),
  );
  await page.route("**/api/auth/sign-in/email", async (route) => {
    authenticated = true;
    await route.fulfill({ status: 200, json: {} });
  });
  await page.route("**/api/auth/sign-out", async (route) => {
    authenticated = false;
    await route.fulfill({ status: 200, json: {} });
  });
  await page.getByLabel("Correo electrónico").fill("ana@example.test");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("UI-password-only-123");
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
});

test("three themes: contrast, layout, self-hosted font and reduced motion", async ({
  page,
}) => {
  await mkdir(captureDirectory, { recursive: true });
  const themes = [
    [0.1, "violet"],
    [0.5, "peach"],
    [0.9, "aqua"],
  ] as const;
  for (const [random, theme] of themes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setup(page, random);
    await expect(page.locator(".app-shell")).toHaveAttribute(
      "data-theme",
      theme,
    );
    const measurements = await page.evaluate(() => {
      const ratio = (a: string, b: string) => {
        const luminance = (value: string) => {
          const values = value
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number)
            .map((n) => n / 255)
            .map((n) =>
              n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4,
            );
          return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
        };
        const x = luminance(a),
          y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const button = getComputedStyle(
        document.querySelector('button[type="submit"]')!,
      );
      const paragraph = getComputedStyle(
        document.querySelector(".auth-content > p")!,
      );
      return {
        button: ratio(button.color, button.backgroundColor),
        paragraph: ratio(paragraph.color, "rgb(255,255,255)"),
        font: document.fonts.check('16px "Nunito Sans"'),
        displayFont: document.fonts.check('italic 40px "Libre Baskerville"'),
      };
    });
    expect(measurements.button).toBeGreaterThanOrEqual(4.5);
    expect(measurements.paragraph).toBeGreaterThanOrEqual(4.5);
    expect(measurements.font).toBe(true);
    expect(measurements.displayFont).toBe(true);
    await page.screenshot({
      path: `${captureDirectory}/${theme === "violet" ? "desktop" : `desktop-${theme}`}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("button", { name: "Iniciar sesión", exact: true }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `${captureDirectory}/${theme === "violet" ? "mobile" : `mobile-${theme}`}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .click();
  expect(
    await page
      .locator(".balance-beam")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await expect(page.locator(".balance-details")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.setViewportSize({ width: 320, height: 640 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("decorative pulse follows the balance and settles without repeating", async ({
  page,
}) => {
  await setup(page);
  const sequence = await page.locator(".balance-scene").evaluate((scene) => {
    const animations = scene.getAnimations({ subtree: true });
    const pulse = animations.find(
      (animation) =>
        (animation as CSSAnimation).animationName === "balance-pulse",
    )!;
    const beam = animations.find(
      (animation) =>
        (animation as CSSAnimation).animationName === "balance-sway",
    )!;
    for (const animation of animations) animation.pause();
    const sample = (time: number) => {
      for (const animation of animations) animation.currentTime = time;
      return {
        opacity: Number(
          getComputedStyle(scene.querySelector(".balance-details")!).opacity,
        ),
        beamProgress: beam.effect!.getComputedTiming().progress,
      };
    };
    const before = sample(3900);
    const during = sample(4400);
    const after = sample(4900);
    return {
      before,
      during,
      after,
      endTime: pulse.effect!.getComputedTiming().endTime,
      iterations: pulse.effect!.getTiming().iterations,
      opacity: getComputedStyle(scene).opacity,
    };
  });
  expect(sequence.before.beamProgress).toBeLessThan(1);
  expect(sequence.during.beamProgress).toBe(1);
  expect(sequence.during.opacity).toBeGreaterThan(sequence.before.opacity);
  expect(sequence.after.opacity).toBeCloseTo(sequence.before.opacity, 2);
  expect(sequence.endTime).toBeLessThanOrEqual(5000);
  expect(sequence.iterations).toBe(1);
  expect(sequence.opacity).toBe("1");
});

test("desktop fills the width and fits the viewport without clipping controls", async ({
  page,
}) => {
  await setup(page);
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1817, height: 875 },
  ]) {
    await page.setViewportSize(viewport);
    const assertFits = async () => {
      await expect(page.locator("input").first()).toBeVisible();
      const geometry = await page.evaluate(() => {
        const rect = document
          .querySelector(".auth-layout")!
          .getBoundingClientRect();
        return {
          width: rect.width,
          top: rect.top,
          bottom: innerHeight - rect.bottom,
          scrollHeight: document.documentElement.scrollHeight,
          sceneLeft: document
            .querySelector(".illustration-panel")!
            .getBoundingClientRect().left,
          sceneWidth: document
            .querySelector(".illustration-panel")!
            .getBoundingClientRect().width,
          sceneRadius: getComputedStyle(
            document.querySelector(".illustration-panel")!,
          ).borderRadius,
          sceneBackground: getComputedStyle(
            document.querySelector(".illustration-panel")!,
          ).backgroundColor,
          brandLeft: document
            .querySelector(".brand svg")!
            .getBoundingClientRect().left,
          fieldLeft: document.querySelector("input")!.getBoundingClientRect()
            .left,
        };
      });
      expect(geometry.width).toBe(viewport.width - 64);
      expect(geometry.top).toBe(32);
      expect(geometry.bottom).toBe(32);
      expect(geometry.scrollHeight).toBe(viewport.height);
      expect(geometry.sceneLeft).toBeCloseTo(
        32 + (viewport.width - 64) * 0.6,
        1,
      );
      expect(geometry.sceneWidth).toBeCloseTo((viewport.width - 64) * 0.4, 1);
      expect(geometry.sceneRadius).toBe("0px");
      expect(geometry.sceneBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(geometry.sceneBackground).not.toBe("rgb(255, 255, 255)");
      expect(geometry.brandLeft).toBeCloseTo(geometry.fieldLeft, 1);
      await expect(page.locator("footer")).toHaveCount(0);
      await expect(page.getByText("Tu dinero, con contexto.")).toHaveCount(0);
      await expect(page.locator('button[type="submit"]')).toBeInViewport();
    };
    await assertFits();
    await page.screenshot({
      path: `${captureDirectory}/wide-${viewport.width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.goto("/recuperar?token=ui-layout-only");
    await expect(
      page.getByRole("heading", { name: "Nueva contraseña" }),
    ).toBeVisible();
    await assertFits();
    await page.goto("/");
  }
});
