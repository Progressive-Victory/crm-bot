import { Event, Logger } from '@Client';
import { server } from '@util/Database';
import { Events, GuildMember } from 'discord.js';
import { onJoin } from 'src/structures/helpers';

export default new Event().setName(Events.GuildBanAdd).setExecute(async (member: GuildMember) => {
	if (member.guild.id === process.env.TRACKING_GUILD) {
		await server.join(member);
		await onJoin(member.id, member.user.tag, member.guild.id);
		Logger.debug(`Added ${member.user.tag} to the database.`);
	}
});
