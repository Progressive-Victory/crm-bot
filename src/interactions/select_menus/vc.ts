import { Interaction } from '@Client';
import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ChannelType, MentionableSelectMenuInteraction, PermissionFlagsBits, TextChannel, VoiceChannel 
} from 'discord.js';
import { basePermissionOverwrites } from 'src/structures/Constants';

const parentID = process.env.EVENT_CATEGORY_ID;

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
	const voiceChannel = event.channel as VoiceChannel;

	const permissionOverwrites = basePermissionOverwrites(interaction).concat(...values.map((id) => ({ id, allow: [PermissionFlagsBits.ViewChannel] })));

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
