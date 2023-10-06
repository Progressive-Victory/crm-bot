import { ExtendedClient } from '../Client';

export { tsNodeRun } from './tsNodeRun';

export type { ChatInputCommandBuilders, Mutable, ReturnableInteraction, TypeCommand } from './types';

export { ExtraColor } from './types';

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
