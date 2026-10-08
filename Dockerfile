# Build the static bundle, then serve it with nginx. The runtime image has no Node in it.
FROM node:22-alpine AS build
WORKDIR /app
ENV CI=true
# Git hooks are for developer machines; there is no .git in the build context.
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1/healthz || exit 1
