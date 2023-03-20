# crm-bot

![Logo](https://github.com/Progressive-Victory/crm-bot/blob/main/assets/badge.png?raw=true) Interval PVBot. Responsible for server utilities and metrics and the server-join action from filling the form

## External Resources

- New to Javascript? Check out [this guide](https://www.codecademy.com/learn/introduction-to-javascript)!
- New to Typescript? Check out [this guide](https://www.freecodecamp.org/news/learn-typescript-beginners-guide/)!
- New to Discord bot development? Check out [this guide](https://discordjs.guide/) and [this set of instructions to enable Developer mode on Discord](https://discord.com/developers/docs/game-sdk/store#application-test-mode).
- Never set up ESlint before? Check out [this demonstration](https://www.digitalocean.com/community/tutorials/workflow-auto-eslinting).

## Setup

1. `CLIENT_ID`, `TOKEN` are discord bot credentials. There's a simple guide available [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to accomplish this.
2. `TEST_GUILD` is the guild ID for testing purposes, for slash commands to only appear in that server. This is an optional variable.
3. `OWNERS` is a comma separated list of user IDs that should have administrator access to the bot. Basically, users in this list skip all permissions checks the bot might do to restrict command usage.
4. `TRACKING_GUILD` is the guild ID for the server that should listen to member activity for the CRM database. For testing purposes, this would probably be equivalent to whatever you'd set in `TEST_GUILD`.
5. `TRACKING_CHANNEL` is the logs channel ID, this needs to be a channel that only permits automated system join messages. Those are the kinds of messages you'll see with sticker prompts when someone joins, basically.
6. `API_AUTH` is the authorization token from [this repo](https://github.com/Progressive-Victory/crm-backend/blob/main/.env.sample), and `API_ENDPOINT` should match the host for that project. You can leave them both as default if you haven't changed anything there. You'll want both projects running.
7. Install [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
8. The default for `DB_URI` is `mongodb://localhost:27017`, change as your settings are configured

## Codebase

- If you want to add a new command, you'll want to make 2 files at minimum. If you're adding a regular slash command, make a new file in `/src/commands/` and a new file in `/src/interactions/commands`. If you're adding a context menu comment (basically, a command that has features after right clicking a message or a user, for example), then you'll want to just make a file in `/src/interactions/contextmenus`. Look at the other files in those directories for example about how these commands should look. The bot will automatically update the commands on restart.
  - Interaction commands support subgroups and subcommands. To make use of the feature here, you can use nested folders in the same context. For example, if you have a command called `/config profile add`, you will want to make a folder called `config`, then a folder called `profile` inside the original folder, then a file called `add.ts`, which has the actual function to run the command. Additionally, you'll need to specify two attributes inside the constructor there. You'll need `name`, which is the root name of the command, in this case, `config`, and `group` would be the next level down, which is `profile` in this case. This allows the bot to internally know the pathway to lead to that command when it's called by a user. For a similar working example, refer to `/src/commands/region-leads/`.
- If you want to modify an event, just add a new file with the event name in `/src/events/` if it doesn't exist already. You can find a list of events [here](https://discord.js.org/#/docs/discord.js/main/class/Client?scrollTo=e-applicationCommandPermissionsUpdate).
- If you want to communicate with the backend, refer to `/src/structures/helpers.ts` - `checkConnected` function.

## Running

Run `yarn dev`
