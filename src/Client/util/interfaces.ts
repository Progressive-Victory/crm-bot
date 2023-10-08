import { ClientOptions } from 'discord.js';

export interface ExtendedClientOptions extends ClientOptions {
	receiveMessageComponents?: boolean;
	receiveModals?: boolean;
	receiveAutocomplete?: boolean;
	replyOnError?: boolean;
	splitCustomID?: boolean;
	splitCustomIDOn?: string;
	useGuildCommands?: boolean;
}

export interface initOptions {
	commandPath?: string;
	contextMenuPath?: string;
	buttonPath?: string;
	selectMenuPath?: string;
	modalPath?: string;
	eventPath: string;
}
