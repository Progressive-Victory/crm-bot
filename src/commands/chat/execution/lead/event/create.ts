import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	ChatInputCommandInteraction,
	GuildScheduledEventCreateOptions,
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
	MentionableSelectMenuBuilder
} from 'discord.js';

const datevalidation = /^([2][0-9]{3})-(0[0-9]|1[0-2])-(0[0-9]|[12]\d|3[01])T([01][0-9]|2[0-3]):([0-5][0-9])/g;

export async function createEvent(interaction: ChatInputCommandInteraction<'cached'>) {
	const {
		guild, locale, options 
	} = interaction;
	const eventCategory = guild.channels.cache.find((c, k) => k === process.env.EVENT_CATEGORY_ID && c.type === ChannelType.GuildCategory) as CategoryChannel;
	if (!eventCategory) {
		throw Error('Faild to find Event Channel Please check .env.EVENT_CATEGORY_ID');
	}

	// Check that date is valid
	const dateString = options
		.getString(t({ key: 'event-option-date', ns }), true)
		.concat('T')
		.concat(options.getString(t({ key: 'event-option-date-time', ns }), true));

	if (!datevalidation.test(dateString)) {
		await interaction.reply({
			content: t({
				key: 'event-bad-date',
				ns,
				locale
			}),
			ephemeral: true
		});
		return;
	}
	const eventdate = new Date(dateString);
	if (eventdate.getTime() <= Date.now()) {
		await interaction.reply({
			content: t({
				key: 'event-date-past',
				ns,
				locale
			}),
			ephemeral: true
		});
		return;
	}

	// Create VC for event
	const eventName = options.getString(t({ key: 'event-option-name', ns }), true).trim();
	const eventVc = await guild.channels.create({
		name: eventName,
		type: ChannelType.GuildVoice,
		parent: eventCategory
	});

	// create event
	const eventOptions: GuildScheduledEventCreateOptions = {
		name: eventName,
		description: options.getString(t({ key: 'event-option-description', ns })).trim(),
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.Voice,
		scheduledStartTime: eventdate,
		channel: eventVc
	};

	const event = await guild.scheduledEvents.create(eventOptions);

	const eventChat = await guild.channels.create({
		name: eventName,
		type: ChannelType.GuildText,
		topic: `Event ID:${event.id}`,
		parent: eventCategory
	});
	await interaction.reply({
		content: t({
			key: 'event-success-create',
			ns,
			locale,
			args: {
				event: event.url,
				vc: eventVc.toString(),
				chat: eventChat.toString()
			}
		}),
		components: [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setEmoji('🗓️')
					.setLabel(
						t({
							key: 'event-success-button-event',
							ns,
							locale
						})
					)
					.setURL(event.url)
					.setStyle(ButtonStyle.Link),
				new ButtonBuilder()
					.setEmoji('🗣️')
					.setLabel(
						t({
							key: 'event-success-button-vc',
							ns,
							locale
						})
					)
					.setURL(eventVc.url)
					.setStyle(ButtonStyle.Link),
				new ButtonBuilder()
					.setEmoji('💬')
					.setLabel(
						t({
							key: 'event-success-button-chat',
							ns,
							locale
						})
					)
					.setURL(eventChat.url)
					.setStyle(ButtonStyle.Link)
			),
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
