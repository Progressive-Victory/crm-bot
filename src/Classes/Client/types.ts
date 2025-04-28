import { ExtendedClient } from './Client.js';

export enum ExtraColor {
	EmbedGray = 0x2b2d31,
	EmbedWhite = 0xf2f3f5
};

// Extend various Discord.js interfaces to include a custom client type
declare module 'discord.js' {
    interface BaseInteraction {
        client: ExtendedClient; // Add custom client to BaseInteraction
    }
    interface Component {
        client: ExtendedClient; // Add custom client to Component
    }
    interface Message {
        client: ExtendedClient; // Add custom client to Message
    }
    interface BaseChannel {
        client: ExtendedClient; // Add custom client to BaseChannel
    }
    interface Role {
        client: ExtendedClient; // Add custom client to Role
    }
    interface Guild {
        client: ExtendedClient; // Add custom client to Guild
    }
    interface User {
        client: ExtendedClient; // Add custom client to User
    }
    interface GuildMember {
        client: ExtendedClient; // Add custom client to GuildMember
    }

}
