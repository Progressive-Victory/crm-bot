import { GuildMember } from 'discord.js';
import Logger from '../structures/Logger';
import { onJoin } from '../structures/helpers';
import Database from '../structures/Database';

export default async function onGuildMemberAdd(member: GuildMember) {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await Database.addJoin(member.id, member.guild.id);
		await onJoin(member.id, member.user.tag, member.guild.id);
		Logger.debug(`Added ${member.user.tag} to the database.`);
	}
}
