# crm-bot

Interval PVBot. Responsible for server utilities and metrics and the server-join action from filling the form

## External Resources

- New to Javascript? Check out [this guide](https://www.codecademy.com/learn/introduction-to-javascript)!
- New to Typescript? Check out [this guide](https://www.freecodecamp.org/news/learn-typescript-beginners-guide/)!
- New to Discord bot development? Check out [this guide](https://discordjs.guide/)! and [this set of instructions to enable Developer mode on Discord](https://discord.com/developers/docs/game-sdk/store#application-test-mode).
- Never set up ESlint before? Check out [this demonstration](https://www.digitalocean.com/community/tutorials/workflow-auto-eslinting).

## Setup

1. `CLIENT_ID`, `TOKEN` are discord bot credentials. There's a simple guide available [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to accomplish this.
2. `TEST_GUILD` is the guild ID for testing purposes, for slash commands to only appear in that server. This is an optional variable.
3. `OWNERS` is a comma separated list of user IDs that should have administrator access to the bot. Basically, users in this list skip all permissions checks the bot might do to restrict command usage.
4. `TRACKING_GUILD` is the guild ID for the server that should listen to member activity for the CRM database. For testing purposes, this would probably be equivalent to whatever you'd set in `TEST_GUILD`.
5. `TRACKING_CHANNEL` is the logs channel ID, this needs to be a channel that only permits automated system join messages. Those are the kinds of messages you'll see with sticker prompts when someone joins, basically.
6. `API_ENDPOINT` is basically where the [other repo](https://github.com/Progressive-Victory/crm-backend/blob/main/.env.sample) is hosted. Leave as default if you haven't changed any config there.
7. `API_AUTH` is the authorization token from [this repo](https://github.com/Progressive-Victory/crm-backend/blob/main/.env.sample), and `API_ENDPOINT` should match the host for that project. You'll want both projects running.
8. Install [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
9. The default for `DB_URI` is `mongodb://localhost:27017`, change as your settings are configured

## Codebase

- If you want to add a new command, you'll want to make 2 files at minimum. If you're adding a regular slash command, make a new file in `/src/commands/` and a new file in `/src/interactions/commands`. If you're adding a context menu comment (basically, a command that has features after right clicking a message or a user, for example), then you'll want to just make a file in `/src/interactions/contextmenus`. Look at the other files in those directories for example about how these commands should look. The bot will automatically update the commands on restart.
- If you want to modify an event, just add a new file with the event name in `/src/events/` if it doesn't exist already. You can find a list of events [here](https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-applicationCommandPermissionsUpdate).

## Running

Run `yarn dev`
