import { TimestampStylesString } from 'discord.js';
import { ExtendedClient } from './Client.js';

export const ExtraColor = {
	EmbedGray: 0x2b2d31,
	EmbedWhite: 0xf2f3f5
};

declare global {
	interface Date {
        /**
         * Get Discord Date sting for Message Formatting
         * @param format Discord code time format option
         * @example
         * import { TimestampStyles } from "discord.js"
         * Date().toDiscordString(TimestampStyles.LongDateTime)
         * // output: <t:1738111980:F>
         * @example
         * Date().toDiscordString()
         * // output: <t:1738111980>
         * @returns Discord time code string
         * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles message formatting timestamp styles} supported by Discord.
         */
		toDiscordString(format?: TimestampStylesString): string;
	}
}

Date.prototype.toDiscordString = function(format) {
	const code = Math.floor(this.getTime() / 1000).toString();
	if (format === undefined) return `<t:${code}`;
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