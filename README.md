# crm-bot

![Logo](https://github.com/Progressive-Victory/crm-bot/blob/main/src/assets/badge.png?raw=true) Interval PVBot. Responsible for server utilities and metrics and the server-join action from filling the form

## Setup

1. `CLIENT_ID`, `TOKEN` are discord bot credentials. There's a simple guide available [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to accomplish this.
2. `TEST_GUILD` is the guild ID for testing purposes, for slash commands to only appear in that server. This is an optional variable.
3. `OWNERS` is a comma separated list of user IDs that should have administrator access to the bot.
4. `TRACKING_GUILD` is the guild ID for the server that should listen to member activity for the CRM database. For testing purposes, this would probably be equivalent to whatever you'd set in `TEST_GUILD`.
5. `TRACKING_CHANNEL` is the logs channel ID, this needs to be a channel that only permits automated system join messages. Those are the kinds of messages you'll see with sticker prompts when someone joins, basically.
6. `API_AUTH` is the authorization token from [this repo](https://github.com/Progressive-Victory/crm-backend/blob/main/.env.sample), and `API_ENDPOINT` should match the host for that project. You can leave them both as default if you haven't changed anything there.
7. The default for `DB_URI` is `mongodb://localhost:27017`, change as your settings are configured

## Running

Run `yarn dev`

## More Reading

For information on how the code works and a more detailed setup guide, refer to the following [guide](https://grateful-touch-3e3.notion.site/PVBot-Backend-Setup-9c16cd2122df4203b40ad88c2e828c27).

When considering contributing, refer to `/.github/CONTRIBUTING.md`!
