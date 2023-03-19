import { ChatInputCommandInteraction } from 'discord.js';
import { checkConnected } from '../structures/helpers';
import Database from '../structures/Database';
import { Command } from '../structures/Command';

export default new Command({
	execute: async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });

		const user = interaction.options.getUser('user');
		const guild = interaction.client.guilds.cache.get(process.env.TRACKING_GUILD) || interaction.guild;

		const metrics = await Database.getMetrics(guild.id, user?.id);

		let str = 'Metrics ';

		if (user) {
			str += `For User: **${user.tag}** (${user.id})\n`;
			str += `**VC Joins**: ${metrics?.vcJoins?.length ?? 0}\n`;
			str += `**VC Leaves**: ${metrics?.vcLeaves?.length ?? 0}\n`;
			// str += `**VC Time**: ${metrics?.vcTime ?? 0} seconds\n`; // TODO
			str += `**Messages**: ${metrics?.messages?.count ?? 0}\n`;
			str += `**Server Joins**: ${metrics?.joins?.length ?? 0}\n`;
			str += `**Server Leaves**: ${metrics?.leaves?.length ?? 0}\n`;
			str += `**Connected Thru Form?**: ${await checkConnected(user.id, guild.id) ? 'Yes' : 'No'}\n`;
		}
		else {
			str += `For Server **${guild.name}** (${guild.id})\n`;
			str += `**Leaves/Members**: ${metrics?.leaves?.length ?? 0}/${guild.memberCount}\n`;

			const memberIDs = await guild.members.fetch()
				.then((members) => members.map((member) => member.id))
				.catch(() => guild.members.cache.map((member) => member.id));

			const memberHandles = memberIDs.map((id) => interaction.client.users.cache.get(id)?.tag ?? id);

			const usersNotInServerButConnected = [];
			const usersNotInServerButNotConnected = [];
			const usersInServerButConnected = [];
			const usersInServerButNotConnected = [];

			const connected = await checkConnected(memberHandles, guild.id);

			for (const [userID, row] of Object.entries(connected)) {
				if (guild.members.cache.has(userID)) continue;
				if (row) usersNotInServerButConnected.push(userID);
				else usersNotInServerButNotConnected.push(userID);
			}

			for (const userID of guild.members.cache.keys()) {
				if (userID in connected) {
					usersInServerButConnected.push(userID);
				}
				else {
					usersInServerButNotConnected.push(userID);
				}
			}

			str += '**Users In Server**\n';
			str += `**Connected**: ${usersInServerButConnected.length}\n`;
			str += `**NOT Connected**: ${usersInServerButNotConnected.length}\n`;
			str += `**VC Joins**: ${metrics.vcJoins.filter((row) => memberIDs.includes(row.userID)).length}\n`;
			str += `**VC Leaves**: ${metrics.vcLeaves.filter((row) => memberIDs.includes(row.userID)).length}\n`;
			str += `**Sent Messages?**: ${metrics.messages.filter((row) => memberIDs.includes(row.userID)).length}\n`;
			str += '\n';

			str += '**Users NOT In Server**\n';
			str += `**Connected**: ${usersNotInServerButConnected.length}\n`;
			str += `**NOT Connected**: ${usersNotInServerButNotConnected.length}\n`;
			str += `**VC Joins**: ${metrics.vcJoins.filter((row) => !memberIDs.includes(row.userID)).length}\n`;
			str += `**VC Leaves**: ${metrics.vcLeaves.filter((row) => !memberIDs.includes(row.userID)).length}\n`;
			str += `**Sent Messages?**: ${metrics.messages.filter((row) => !memberIDs.includes(row.userID)).length}\n`;
		}

		return interaction.editReply(str);
	}
});
