import { GuildMember } from 'discord.js';
import Database from '../structures/Database';

export default async function onGuildMemberRemove(member: GuildMember) {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await Database.addLeave(member.id, member.guild.id);
	}
}
