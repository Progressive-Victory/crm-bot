import { GuildMember } from "discord.js";

export interface UpdateStackOptions {
	owner?:GuildMember | null
	add?:[GuildMember, boolean]
	remove?:number
}
