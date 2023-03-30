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

export interface Language {
	Objects: {
		Meeting: string
	}
	Generics: {
		NotImplemented: (command: string) => string
		Error: () => string
		NoRole: (name?: string) => string
		StateRegionMismatch: (user: Discord.User) => string
	}
	Permissions: {
		NoCommandPermissions: (command: string, permissions?: string[], type?: string, serverwideType?: string) => string
		BotOwners: (command: string) => string
		ServerOnly: (command: string) => string
	}
	Commands: {
		Lead: {
			Region: {
				Role: {
					Success: (role: Discord.Role, user: Discord.User, add: boolean) => string
					Error: (role: Discord.Role, user: Discord.User, add: boolean) => string
					AuditLog: (role: Discord.Role, user: Discord.User, add: boolean) => string
				}
			},
			VC: {
				Rename: {
					Success: (channel: Discord.VoiceChannel) => string
					Error: (channel: Discord.VoiceChannel) => string
					WrongChannel: (channel: Discord.VoiceChannel, allowed: string[]) => string
					AuditLogRename: (channel: Discord.VoiceChannel, user: Discord.User) => string
					AuditLogUndo: () => string
				}
			}
		},
		Metrics: {
			Title: () => string,
			User: () => string,
			VCJoins: () => string,
			VCLeaves: () => string,
			Messages: () => string,
			ServerJoins: () => string,
			ServerLeaves: () => string,
			ConnectedForm: () => string,
			Server: () => string,
			LeavesToMemberCount: () => string,
			UsersInServer: () => string,
			NotInServer: () => string,
			Connected: () => string,
			NotConnected: () => string
		}
	}
}
