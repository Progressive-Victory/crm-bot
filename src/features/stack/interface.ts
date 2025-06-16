import { GuildMember } from "discord.js";

export interface UpdateStackOptions {
	owner?: GuildMember | null;
	add?: [GuildMember, boolean];
	urgent?: number;
	remove?: number;
}
