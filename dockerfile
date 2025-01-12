FROM node:lts-iron AS builder
WORKDIR /bot

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:lts-iron AS runner
WORKDIR /bot

COPY package.json .
COPY yarn.lock .
COPY ./locales ./locales

RUN yarn install --frozen-lockfile --production

COPY --from=builder /bot/dist/ ./dist
# COPY ./src/*.json ./dist

USER node

CMD [ "yarn", "start" ]
