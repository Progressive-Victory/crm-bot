FROM node:lts-hydrogen AS builder
WORKDIR /usr/bot

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:lts-hydrogen AS runner
WORKDIR /usr/bot

COPY package*.json .

COPY ./locales ./locales

RUN yarn install --production

COPY --from=builder /usr/bot/dist/ ./dist

COPY ./src/*.json ./dist

USER node

CMD [ "yarn", "start" ]