import { ChatInputCommandInteraction } from 'discord.js';
import { checkConnected } from '../structures/helpers';
import Database from '../structures/Database';
import { Command } from '../structures/Command';
import Languages from '../assets/languages';

export default new Command({
	name: 'metrics',
	execute: async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });

		const user = interaction.options.getUser('user');
		const guild = interaction.client.guilds.cache.get(process.env.TRACKING_GUILD) || interaction.guild;

		const metrics = await Database.getMetrics(guild.id, user?.id);

		const commandLanguage = Languages[interaction.language].Commands.Metrics;

		let str = `${commandLanguage.Title()}\n `;

		if (user) {
			str += `${commandLanguage.User()}: **${user.tag}** (${user.id})\n`;
			str += `**${commandLanguage.VCJoins()}**: ${metrics?.vcJoins?.length ?? 0}\n`;
			str += `**${commandLanguage.VCLeaves()}**: ${metrics?.vcLeaves?.length ?? 0}\n`;
			// str += `**VC Time**: ${metrics?.vcTime ?? 0} seconds\n`; // TODO
			str += `**${commandLanguage.Messages()}**: ${metrics?.messages?.count ?? 0}\n`;
			str += `**${commandLanguage.ServerJoins()}**: ${metrics?.joins?.length ?? 0}\n`;
			str += `**${commandLanguage.ServerLeaves()}**: ${metrics?.leaves?.length ?? 0}\n`;
			str += `**${commandLanguage.ConnectedForm()}?**: ${await checkConnected(user.id, guild.id) ? 'Yes' : 'No'}\n`;
		}
		else {
			str += `${commandLanguage.Server()} **${guild.name}** (${guild.id})\n`;
			str += `**${commandLanguage.LeavesToMemberCount()}**: ${metrics?.leaves?.length ?? 0}/${guild.memberCount}\n`;

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

			str += `**${commandLanguage.UsersInServer()}**\n`;
			str += `**${commandLanguage.Connected()}**: ${usersInServerButConnected.length}\n`;
			str += `**${commandLanguage.NotConnected()}**: ${usersInServerButNotConnected.length}\n`;
			str += `**${commandLanguage.VCJoins()}**: ${metrics.vcJoins.filter((row) => memberIDs.includes(row.userID)).length}\n`;
			str += `**${commandLanguage.VCLeaves()}**: ${metrics.vcLeaves.filter((row) => memberIDs.includes(row.userID)).length}\n`;
			str += `**${commandLanguage.Messages()}?**: ${metrics.messages.filter((row) => memberIDs.includes(row.userID)).length}\n`;
			str += '\n';

			str += `**${commandLanguage.NotInServer()}**\n`;
			str += `**${commandLanguage.Connected()}**: ${usersNotInServerButConnected.length}\n`;
			str += `**${commandLanguage.NotConnected()}**: ${usersNotInServerButNotConnected.length}\n`;
			str += `**${commandLanguage.VCJoins()}**: ${metrics.vcJoins.filter((row) => !memberIDs.includes(row.userID)).length}\n`;
			str += `**${commandLanguage.VCLeaves()}**: ${metrics.vcLeaves.filter((row) => !memberIDs.includes(row.userID)).length}\n`;
			str += `**${commandLanguage.Messages()}?**: ${metrics.messages.filter((row) => !memberIDs.includes(row.userID)).length}\n`;
		}

		return interaction.editReply(str);
	}
});
