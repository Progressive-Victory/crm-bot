import { config } from 'dotenv';
import { join } from 'path';

import {
	GatewayIntentBits as Intents, Locale, Partials 
} from 'discord.js';
import { Client } from './Client';
import { init } from './i18n';

// Load .env file contents
config();

// i18n Initialization
init(join(__dirname, '../locales'), { fallback: Locale.EnglishUS, hasGlobal: true });

// Initialization (specify intents and partials)
const client = new Client({
	intents: [Intents.Guilds, Intents.GuildMessages, Intents.GuildVoiceStates, Intents.MessageContent, Intents.GuildMembers, Intents.GuildModeration],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember],
	eventPath: join(__dirname, 'events'),
	commandPath: join(__dirname, 'commands', 'chat', 'builders'),
	contextMenuPath: join(__dirname, 'commands', 'context_menu'),
	buttonPath: join(__dirname, 'interactions', 'buttons'),
	selectMenuPath: join(__dirname, 'interactions', 'select_menus'),
	modalPath: join(__dirname, 'interactions', 'modals'),
	receiveMessageComponents: true,
	receiveModals: true,
	receiveAutocomplete: true,
	replyOnError: true,
	splitCustomID: true,
	splitCustomIDOn: '_',
	useGuildCommands: false
});

client.login(process.env.TOKEN).then(() => {
	if (!process.argv.includes('--no-deployment')) {
		client.deploy();
	}
});
