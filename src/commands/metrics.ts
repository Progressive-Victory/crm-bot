import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits
} from 'discord.js';
import i18n from 'i18next';
import { checkConnected } from '../structures/helpers';
import Database from '../structures/Database';
import { ChatInputCommand } from '../structures/Command';

const ns = 'meteric';

async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
	await interaction.deferReply({ ephemeral: true });

	const user = interaction.options.getUser('user');
	const guild =
		interaction.client.guilds.cache.get(process.env.TRACKING_GUILD) ||
		interaction.guild;

	const metrics = await Database.getMetrics(guild.id, user?.id);

	const reply = new EmbedBuilder();

	if (user) {
		const userPFP = user.avatarURL({ forceStatic: true, size: 512 });
		reply
			.setTitle(
				i18n.t('user-embed-title', { lng: interaction.locale, ns })
			)
			.setThumbnail(userPFP)
			.setAuthor({ iconURL: userPFP, name: user.tag })
			.setFields(
				{
					name: i18n.t('user-embed-vc-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('user-embed-vc-value', {
						lng: interaction.locale,
						ns,
						joins: `${metrics?.vcJoins?.length ?? 0}`,
						leaves: `${metrics?.vcLeaves?.length ?? 0}`
					})
				},
				{
					name: i18n.t('user-embed-messages-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('user-embed-messages-value', {
						lng: interaction.locale,
						ns,
						messages: `${metrics?.messages?.count ?? 0}`
					})
				},
				{
					name: i18n.t('user-embed-server-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('user-embed-server-value', {
						lng: interaction.locale,
						ns,
						joins: `${metrics?.joins?.length ?? 0}`,
						leaves: `${metrics?.leaves?.length ?? 0}`
					})
				},
				{
					name: i18n.t('user-embed-connected-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('user-embed-connected-value', {
						lng: interaction.locale,
						ns,
						connected: `${
							(await checkConnected(user.id, guild.id))
								? 'Yes'
								: 'No'
						}`
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

		const memberHandles = memberIDs.map(
			(id) => interaction.client.users.cache.get(id)?.tag ?? id
		);

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

		reply
			.setTitle(
				i18n.t('server-embed-title', { lng: interaction.locale, ns })
			)
			.setThumbnail(guild.iconURL({ forceStatic: true, size: 1024 }))
			.setFields(
				{
					name: i18n.t('server-embed-members-count-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('server-embed-members-count-value', {
						lng: interaction.locale,
						ns,
						leaves: `${metrics?.leaves?.length ?? 0}`,
						membercount: `${guild.memberCount}`
					})
				},
				{
					name: i18n.t('server-embed-in-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('server-embed-user-value', {
						lng: interaction.locale,
						ns,
						connected: `${usersInServerButConnected.length}`,
						notconnected: `${usersInServerButNotConnected.length}`,
						joins: `${
							metrics.vcJoins.filter((row) =>
								memberIDs.includes(row.userID)
							).length
						}`,
						leaves: `${
							metrics.vcLeaves.filter((row) =>
								memberIDs.includes(row.userID)
							).length
						}`,
						messages: `${
							metrics.messages.filter((row) =>
								memberIDs.includes(row.userID)
							).length
						}`
					})
				},
				{
					name: i18n.t('server-embed-out-name', {
						lng: interaction.locale,
						ns
					}),
					value: i18n.t('server-embed-user-value', {
						lng: interaction.locale,
						ns,
						connected: `${usersInServerButConnected.length}`,
						notconnected: `${usersInServerButNotConnected.length}`,
						joins: `${
							metrics.vcJoins.filter(
								(row) => !memberIDs.includes(row.userID)
							).length
						}`,
						leaves: `${
							metrics.vcLeaves.filter(
								(row) => !memberIDs.includes(row.userID)
							).length
						}`,
						messages: `${
							metrics.messages.filter(
								(row) => !memberIDs.includes(row.userID)
							).length
						}`
					})
				}
			);
	}

	return interaction.editReply({ embeds: [reply] });
}

export default new ChatInputCommand()
	.setBuilder((command) =>
		command
			.setName('metrics')
			.setDescription(
				'Shows general metrics for the server or a specific user.'
			)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to get metrics for.')
					.setRequired(false)
			)
	)
	.setExecute(execute);
