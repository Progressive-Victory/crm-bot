import { serverLeaves } from '@util/database';
import { Event, logger } from 'discord-client';
import { Events, GuildMember } from 'discord.js';

const { TRACKING_GUILD } = process.env;

export default new Event().setName(Events.GuildMemberRemove).setExecute(async (member: GuildMember) => {
	if (member.guild.id === TRACKING_GUILD) {
		await serverLeaves.createFromMember(member);
		logger.debug(`Added ${member.id} to the leave database.`);
	}
});
