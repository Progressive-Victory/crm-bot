import { GuildMember } from 'discord.js';
import Logger from '../structures/Logger';
import Database from '../structures/Database';

export default async function onGuildMemberRemove(member: GuildMember) {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await Database.addLeave(member.id, member.guild.id);
		Logger.debug(`Added ${member.id} to the leave database.`);
	}
}
