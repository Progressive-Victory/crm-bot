# crm-bot

BI &amp; Analytics

## Setup

1. `CLIENT_ID`, `TOKEN` are discord bot credentials.
2. `TEST_GUILD` is the guild ID for testing purposes, for slash commands to only appear in that server.
3. `OWNERS` is a comma separated list of user IDs that should have administrator access to the bot
4. `TRACKING_GUILD` is the guild ID for the server that should listen to member activity for the CRM database
5. `TRACKING_CHANNEL` is the logs channel ID, this needs to be a channel that only permits automated system join messages
6. `API_AUTH` is the authorization token from [this repo](https://github.com/Progressive-Victory/crm-backend/blob/main/.env.sample), and `API_ENDPOINT` should match the host for that project
7. Install [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
8. The default for `DB_URI` is `mongodb://localhost:27017`, change as your settings are configured

## Running

Run `yarn dev`
