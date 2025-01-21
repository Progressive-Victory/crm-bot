FROM node:22.13-alpine AS builder
WORKDIR /bot

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:22.13-alpine AS runner
WORKDIR /bot

COPY package.json .
COPY yarn.lock .
COPY ./locales ./locales

RUN yarn install --frozen-lockfile --production

COPY --from=builder /bot/dist/ ./dist
# COPY ./src/*.json ./dist

EXPOSE 8080
USER node

CMD [ "yarn", "start" ]
