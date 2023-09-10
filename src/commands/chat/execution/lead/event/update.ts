import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ActionRowBuilder, ChannelType, ChatInputCommandInteraction, MentionableSelectMenuBuilder 
} from 'discord.js';

export async function updateEvent(interaction: ChatInputCommandInteraction<'cached'>) {
	const {
		locale, guild, options 
	} = interaction;

	const textChannel = options.getChannel(t({ key: 'event-option-channel', ns }), true, [ChannelType.GuildText]);
	const event = guild.scheduledEvents.cache.find((_e, k) => k === textChannel.topic.split(':')[1]);

	if (!event || !(textChannel.parentId === process.env.EVENT_CATEGORY_ID)) {
		await interaction.reply({
			content: t({
				key: 'event-channel-bad-category',
				ns,
				locale
			}),
			ephemeral: true
		});
		return;
	}

	await interaction.reply({
		components: [
			new ActionRowBuilder<MentionableSelectMenuBuilder>().addComponents(
				new MentionableSelectMenuBuilder()
					.setCustomId(`vc_${event.id}`)
					.setPlaceholder(
						t({
							key: 'event-select-menu',
							ns,
							locale
						})
					)
					.setMinValues(1)
					.setMaxValues(20)
			)
		],
		ephemeral: true
	});
}
