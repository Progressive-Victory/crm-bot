import { TimestampStyles, TimestampStylesString } from 'discord.js';
import { ExtendedClient } from './Client.js';

export const ExtraColor = {
	EmbedGray: 0x2b2d31,
	EmbedWhite: 0xf2f3f5
};

declare global {
	interface Date {
		/**
		 * Prints date to Discord Timestamp Styles
		 * @param format Discord TimestampStylesString
		 * @returns date formatted fro a message
		 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
		 */
		toDiscordString(format?: TimestampStylesString): `<t:${number}:${TimestampStylesString}>`;
	}
}

Date.prototype.toDiscordString = function(format: TimestampStylesString = TimestampStyles.ShortDateTime ) {
	const code = Math.floor(this.getTime() / 1000);
	return `<t:${code}:${format}>`;
};

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
