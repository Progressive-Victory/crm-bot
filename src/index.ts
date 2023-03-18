import { join } from 'path';
//

import { config } from 'dotenv';
import { GatewayIntentBits, Partials } from 'discord.js';

import CustomClient from './structures/CustomClient';
import prototypes from './structures/prototypes';
import { CustomClientOptions } from './declarations/typings';

config();
prototypes();

const clientOptions: CustomClientOptions = {
	token: process.env.TOKEN,
	eventsDir: join(__dirname, 'events'),
	commandsDir: join(__dirname, 'commands'),
	interactionsDir: join(__dirname, 'interactions'),
	partials: [Partials.Reaction, Partials.User, Partials.Channel, Partials.Message],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		// Analytics & Metrics
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates
	]
};

const client = new CustomClient(clientOptions);

client.launch();
