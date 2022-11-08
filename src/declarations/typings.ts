import Discord from 'discord.js';
import CustomClient from '../structures/CustomClient';

declare module 'discord.js' {
	interface Guild {
		client: CustomClient
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

	interface ButtonInteraction {
		client: CustomClient
	}

	interface CommandInteraction {
		client: CustomClient
	}

	interface SelectMenuInteraction {
		client: CustomClient
	}

	interface AutocompleteInteraction {
		client: CustomClient
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
