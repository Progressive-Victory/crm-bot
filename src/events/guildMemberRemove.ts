import { Event, Logger } from '@Client';
import { Events, GuildMember } from 'discord.js';
import Database from 'src/structures/Database';

export default new Event().setName(Events.GuildMemberRemove).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await Database.addLeave(member.id, member.guild.id);
		Logger.debug(`Added ${member.id} to the leave database.`);
	}
});
