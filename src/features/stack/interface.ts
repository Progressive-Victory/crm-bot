import { GuildMember, Snowflake } from "discord.js";

export interface UpdateStackOptions {
	owner?: GuildMember | null;
	add?: QueueMember;
	urgent?: number;
	remove?: number;
	next?: boolean;
}

export interface QueueMember {
	memberId: Snowflake,
	priority: boolean
}
