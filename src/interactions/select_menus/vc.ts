import { ns } from '@builders/lead';
import { t } from '@i18n';
import { Interaction } from '@progressive-victory/client';
import {
	ChannelType,
	MentionableSelectMenuInteraction,
	OverwriteResolvable,
	PermissionFlagsBits,
	PermissionsBitField,
	TextChannel,
	VoiceChannel
} from 'discord.js';

const parentID = process.env.EVENT_CATEGORY_ID;
const flags = new PermissionsBitField([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles]);

/**
 *
 * @param interaction menu interaction object
 */
async function execute(interaction: MentionableSelectMenuInteraction) {
	const {
		guild, locale, values 
	} = interaction;
	// Get Event and validate
	const event = guild.scheduledEvents.cache.find((_c, k) => k === interaction.customId.split(interaction.client.splitCustomIDOn)[1]);
	if (!event) {
		await interaction.update({ content: 'Event was deleted', components: [] });
	}

	// Get channels
	const textChannel = guild.channels.cache.find(
		(c) => c.parentId === parentID && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === event.id
	) as TextChannel;

	const basePerms: OverwriteResolvable[] = textChannel.parent.permissionOverwrites.cache
		.map((po) => ({
			id: po.id,
			allow: po.allow,
			deny: po.deny
		}))
		.concat([
			{
				id: interaction.user.id,
				allow: flags,
				deny: undefined
			}
		]);

	const voiceChannel = event.channel as VoiceChannel;

	const permissionOverwrites = basePerms.concat(...values.map((id) => ({ id, allow: [PermissionFlagsBits.ViewChannel] })));

	await Promise.all([textChannel.permissionOverwrites.set(permissionOverwrites), voiceChannel.permissionOverwrites.set(permissionOverwrites)]);

	await interaction.reply({
		content: t({
			key: 'event-select-reply',
			ns,
			locale
		}),
		ephemeral: true
	});
}

export default new Interaction<MentionableSelectMenuInteraction>().setName('vc').setExecute(execute);
