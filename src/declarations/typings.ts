import Discord from 'discord.js';

declare global {
	interface Date {
		discordTimestamp: string;
		discordDuration: string;
		discordDay: string;
	}

	interface String {
		toTitleCase(): string;
	}
}

export type CustomClientOptions = {
	token: string;
	interactionsDir: string;
	commandsDir: string;
	eventsDir: string;
	partials: Discord.Partials[];
	intents: Discord.GatewayIntentBits[];
	presence?: Discord.PresenceData;
};
