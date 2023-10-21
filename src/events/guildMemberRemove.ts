import { serverLeaves } from '@util/Database';
import { Event, Logger } from 'discord-client';
import { Events, GuildMember } from 'discord.js';

export default new Event().setName(Events.GuildMemberRemove).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await serverLeaves.createFromMember(member);
		Logger.debug(`Added ${member.id} to the leave database.`);
	}
});
