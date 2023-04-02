import Discord from 'discord.js';
import CustomClient from '../structures/CustomClient';
import { SupportedLanguage } from '../assets/languages';

declare module 'discord.js' {
	interface Guild {
		client: CustomClient
		preferredLanguage: SupportedLanguage
	}

	interface User {
		client: CustomClient
	}

	interface GuildMember {
		client: CustomClient
	}

	interface Role {
		client: CustomClient
	}

	interface BaseInteraction {
		client: CustomClient
		language: SupportedLanguage
		key: string
	}

	interface Message {
		client: CustomClient
	}

	interface TextChannel {
		client: CustomClient
	}

	interface VoiceChannel {
		client: CustomClient
	}

	interface ThreadChannel {
		client: CustomClient
	}

	interface DMChannel {
		client: CustomClient
	}
}

declare global {
	interface Date {
		discordTimestamp: string
		discordDuration: string
		discordDay: string
	}

	interface String {
		toTitleCase(): string
	}
}

export type CustomClientOptions = {
	token: string;
	interactionsDir: string;
	commandsDir: string;
	eventsDir: string;
	partials: Discord.Partials[];
	intents: Discord.GatewayIntentBits[];
	presence?: Discord.PresenceData
}
