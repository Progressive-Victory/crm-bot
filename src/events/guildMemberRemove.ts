import { Event, logger } from '@progressive-victory/client';
import { serverLeaves } from '@util/database';
import { Events, GuildMember } from 'discord.js';

export default new Event().setName(Events.GuildMemberRemove).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await serverLeaves.createFromMember(member);
		logger.debug(`Added ${member.id} to the leave database.`);
	}
});
