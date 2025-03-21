import { AnySelectMenuInteraction, GatewayIntentBits as Intents } from "discord.js";
import express from "express";
import { Client, Interaction } from "./Classes/index.js";
import * as commands from "./commands/index.js";
import * as events from "./events/index.js";
import * as buttons from './interactions/buttons/index.js';
import * as modals from './interactions/modals/index.js';
import * as selectMenus from './interactions/select_menus/index.js';

// Initialization (specify intents and partials)

export const client = new Client({
  intents: [
    Intents.Guilds,
    Intents.GuildMessages,
    Intents.GuildVoiceStates,
    Intents.MessageContent,
    Intents.GuildMembers,
    Intents.GuildModeration,
    Intents.GuildScheduledEvents,
    Intents.GuildMessageReactions,
  ],
  // partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.GuildScheduledEvent],
  receiveMessageComponents: true,
  receiveModals: true,
  receiveAutocomplete: true,
  replyOnError: true,
  splitCustomIdOn: "_",
  useDefaultInteractionEvent: true,
});

// Load Events
for (const event of Object.values(events)) client.events.add(event);

// Load commands
for (const command of Object.values(commands)) client.commands.add(command);

// Load buttons
for (const button of Object.values(buttons))
	client.interactions.addButton(button);

// Load modals
for (const modal of Object.values(modals))
	client.interactions.addModal(modal);

// Load selectMenus
for (const selectMenu of Object.values(selectMenus))
	client.interactions.addSelectMenu(selectMenu as Interaction<AnySelectMenuInteraction>);

// Bot logins to Discord services
void client.login(process.env.DISCORD_TOKEN).then(() => {
  // Skip if no-deployment flag is set, else deploys command
  if (!process.argv.includes("--no-deployment"))
    // removes guild command from set guild
    // client.commands.deregisterGuildCommands(process.env.GUILDID);
    // deploys commands
    void client.commands.register();
});

// Express Server
const app = express();
const port = process.env.PORT ?? 'No port set'
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
