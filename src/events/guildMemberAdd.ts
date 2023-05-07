import { Events, GuildMember } from 'discord.js';
import { Event } from '../Client';
import Logger from '../structures/Logger';
import { onJoin } from '../structures/helpers';
import Database from '../structures/Database';

export default new Event().setName(Events.GuildBanAdd).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await Database.addJoin(member.id, member.guild.id);
		await onJoin(member.id, member.user.tag, member.guild.id);
		Logger.debug(`Added ${member.user.tag} to the database.`);
	}
});
