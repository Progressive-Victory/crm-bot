import { Interaction } from '@Client';
import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ChannelType, GuildMember, MentionableSelectMenuInteraction, PermissionOverwriteOptions, Role, TextChannel, VoiceChannel 
} from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;

/**
 *
 * @param interaction menu interaction object
 */
async function execute(interaction: MentionableSelectMenuInteraction) {
	const {
		roles, members, guild, locale 
	} = interaction;
	// Get Event and validate
	const event = guild.scheduledEvents.cache.find((_c, k) => k === interaction.customId.split(interaction.client.splitCustomIDOn)[1]);
	if (!event) {
		await interaction.update({ content: 'Event was Deleted', components: [] });
	}

	// Get channels
	const textChannel = guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === event.id
	) as TextChannel;
	const voiceChannel = event.channel as VoiceChannel;

	// Rest channel perms
	await Promise.all([textChannel.lockPermissions(), voiceChannel.lockPermissions()]);
	const perms: Partial<PermissionOverwriteOptions> = { ViewChannel: true };

	// set new channel perms and send reply
	await Promise.all([
		// perms for the interaction user
		textChannel.permissionOverwrites.edit(interaction.user, perms),
		voiceChannel.permissionOverwrites.edit(interaction.user, perms),
		// add perms for select members
		async () => {
			for (const [, member] of members) {
				await textChannel.permissionOverwrites.edit(member as GuildMember, perms);
				await voiceChannel.permissionOverwrites.edit(member as GuildMember, perms);
			}
		},
		// add perms for selected roles
		async () => {
			for (const [, role] of roles) {
				await textChannel.permissionOverwrites.edit(role as Role, perms);
				await voiceChannel.permissionOverwrites.edit(role as Role, perms);
			}
		},
		// send success messages
		interaction.reply({
			content: t({
				key: 'event-select-reply',
				ns,
				locale
			}),
			ephemeral: true
		})
	]);
}

export default new Interaction<MentionableSelectMenuInteraction>().setName('vc').setExecute(execute);
