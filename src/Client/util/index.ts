import { ExtendedClient } from '../Client';
import { TimeStyle } from './types';

export { tsNodeRun } from './tsNodeRun';

export { TimeStyles } from './time';

export type { ChatInputCommandBuilders, Mutable, ReturnableInteraction, TimeStyle, TypeCommand } from './types';

export { ExtraColor } from './types';

export { Logger } from './Logger';

declare module 'discord.js' {
	interface BaseInteraction {
		client: ExtendedClient;
	}
	interface Component {
		client: ExtendedClient;
	}
	interface Message {
		client: ExtendedClient;
	}
	interface BaseChannel {
		client: ExtendedClient;
	}
	interface Role {
		client: ExtendedClient;
	}
	interface Guild {
		client: ExtendedClient;
	}
	interface User {
		client: ExtendedClient;
	}
	interface GuildMember {
		client: ExtendedClient;
	}
}

declare global {
	interface Date {
		/**
		 * Convert Date object to Discord Formated sting
		 * @param format The Style that will be used on the time stamp
		 * @see https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
		 */
		toDiscordString(style?: TimeStyle): string;
	}
}
