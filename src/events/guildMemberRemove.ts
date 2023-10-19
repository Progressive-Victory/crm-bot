import { Event, Logger } from '@Client';
import { serverLeaves } from '@util/Database';
import { Events, GuildMember } from 'discord.js';

export default new Event().setName(Events.GuildMemberRemove).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		Logger.debug(`Added ${member.id} to the leave database.`);
		await serverLeaves.createFromMember(member);
	}
});
