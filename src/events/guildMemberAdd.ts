import { onJoin } from '@util/backend';
import { serverJoins } from '@util/database';
import { Event, logger } from 'discord-client';
import { Events, GuildMember } from 'discord.js';

const { TRACKING_GUILD } = process.env;

export default new Event().setName(Events.GuildBanAdd).setExecute(async (member: GuildMember) => {
	if (member.guild.id === TRACKING_GUILD) {
		await Promise.all([serverJoins.createFromMember(member), onJoin(member.id, member.user.tag, member.guild.id)]);

		logger.debug(`Added ${member.user.tag} to the database.`);
	}
});
