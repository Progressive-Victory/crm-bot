import { Event, Logger } from '@Client';
import { serverJoins } from '@util/Database';
import { Events, GuildMember } from 'discord.js';
import { onJoin } from 'src/structures/helpers';

export default new Event().setName(Events.GuildBanAdd).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await serverJoins.createFromMember(member);
		await onJoin(member.id, member.user.tag, member.guild.id);
		Logger.debug(`Added ${member.user.tag} to the database.`);
	}
});
