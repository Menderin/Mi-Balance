FROM docker.io/library/node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY apps/web apps/web
RUN npm run build --workspace @mi-balance/web

FROM docker.io/library/nginx:1.28-alpine
COPY apps/web/nginx.conf /etc/nginx/templates/default.conf.template
COPY apps/web/19-resolver.envsh /docker-entrypoint.d/19-resolver.envsh
RUN chmod +x /docker-entrypoint.d/19-resolver.envsh
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
