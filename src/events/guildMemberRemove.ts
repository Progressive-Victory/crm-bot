import { Events, GuildMember } from 'discord.js';
import { Event } from '../Client';
import Logger from '../structures/Logger';
import Database from '../structures/Database';

export default new Event().setName(Events.GuildMemberRemove).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await Database.addLeave(member.id, member.guild.id);
		Logger.debug(`Added ${member.id} to the leave database.`);
	}
});
