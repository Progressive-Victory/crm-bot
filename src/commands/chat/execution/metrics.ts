import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { checkConnected } from '../../../structures/helpers';
import Database from '../../../structures/Database';
import { t } from '../../../i18n';

const ns = 'metric';

export async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	const user = interaction.options.getUser('user');
	const guild = interaction.client.guilds.cache.get(process.env.TRACKING_GUILD) || interaction.guild;

	const metrics = await Database.getMetrics(guild.id, user?.id);

	const embed = new EmbedBuilder();

	const { locale } = interaction;

	if (user) {
		const userPFP = user.avatarURL({ size: 512 });
		embed
			.setTitle(
				t({
					key: 'user-embed-title',
					locale,
					ns
				})
			)
			.setThumbnail(userPFP)
			.setAuthor({ iconURL: userPFP, name: user.tag })
			.setFields(
				{
					name: t({
						key: 'user-embed-vc-name',
						locale,
						ns
					}),
					value: t({
						key: 'user-embed-vc-value',
						locale,
						ns,
						args: {
							joins: `${metrics?.vcJoins?.length ?? 0}`,
							leaves: `${metrics?.vcLeaves?.length ?? 0}`
						}
					})
				},
				{
					name: t({
						key: 'user-embed-messages-name',
						locale,
						ns
					}),
					value: t({
						key: 'user-embed-messages-value',
						locale,
						ns,
						args: { messages: `${metrics?.messages?.count ?? 0}` }
					})
				},
				{
					name: t({
						key: 'user-embed-server-name',
						locale,
						ns
					}),
					value: t({
						key: 'user-embed-server-value',
						locale,
						ns,
						args: {
							joins: `${metrics?.joins?.length ?? 0}`,
							leaves: `${metrics?.leaves?.length ?? 0}`
						}
					})
				},
				{
					name: t({
						key: 'user-embed-connected-name',
						locale,
						ns
					}),
					value: t({
						key: 'user-embed-connected-value',
						locale,
						ns,
						args: { connected: `${(await checkConnected(user.id, guild.id)) ? 'Yes' : 'No'}` }
					})
				}
			)
			.setTimestamp();
	}
	else {
		const memberIDs = await guild.members
			.fetch()
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

		embed
			.setTitle(
				t({
					key: 'server-embed-title',
					locale,
					ns
				})
			)
			.setThumbnail(guild.iconURL({ forceStatic: true, size: 1024 }))
			.setFields(
				{
					name: t({
						key: 'server-embed-members-count-name',
						locale,
						ns
					}),
					value: t({
						key: 'server-embed-members-count-value',
						locale,
						ns,
						args: {
							leaves: `${metrics?.leaves?.length ?? 0}`,
							membercount: `${guild.memberCount}`
						}
					})
				},
				{
					name: t({
						key: 'server-embed-in-name',
						locale,
						ns
					}),
					value: t({
						key: 'server-embed-user-value',
						locale,
						ns,
						args: {
							connected: `${usersInServerButConnected.length}`,
							notconnected: `${usersInServerButNotConnected.length}`,
							joins: `${metrics.vcJoins.filter((row) => memberIDs.includes(row.userID)).length}`,
							leaves: `${metrics.vcLeaves.filter((row) => memberIDs.includes(row.userID)).length}`,
							messages: `${metrics.messages.filter((row) => memberIDs.includes(row.userID)).length}`
						}
					})
				},
				{
					name: t({
						key: 'server-embed-out-name',
						locale,
						ns
					}),
					value: t({
						key: 'server-embed-user-value',
						locale,
						ns,
						args: {
							connected: `${usersInServerButConnected.length}`,
							notconnected: `${usersInServerButNotConnected.length}`,
							joins: `${metrics.vcJoins.filter((row) => !memberIDs.includes(row.userID)).length}`,
							leaves: `${metrics.vcLeaves.filter((row) => !memberIDs.includes(row.userID)).length}`,
							messages: `${metrics.messages.filter((row) => !memberIDs.includes(row.userID)).length}`
						}
					})
				}
			);
	}

	return interaction.editReply({ embeds: [embed] });
}
