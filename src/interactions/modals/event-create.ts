import { ns } from '@builders/lead';
import { t } from '@i18n';
import { EventsDB } from '@util/Database';
import {
	createEventMemberRoleSelectMenu, eventChatLinkButton, eventLinkButton, eventVCLinkButton 
} from '@util/event';
import { Interaction, logger } from 'discord-client';
import {
	ActionRowBuilder,
	ButtonBuilder,
	CategoryChannel,
	ChannelType,
	GuildScheduledEventCreateOptions,
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
	ModalSubmitInteraction,
	PermissionFlagsBits
} from 'discord.js';
import { basePermissionOverwrites } from '../../structures/Constants';

// const dateValidation = /^([2][0-9]{3})-(0[0-9]|1[0-2])-(0[0-9]|[12]\d|3[01])T([01][0-9]|2[0-3]):([0-5][0-9])/g;
const eventCategoryId = process.env.EVENT_CATEGORY_ID;

export default new Interaction<ModalSubmitInteraction>().setName('event').setExecute(async (interaction) => {
	const {
		guild, locale, fields, appPermissions 
	} = interaction;

	// Check bot permissions
	if (!appPermissions.has(PermissionFlagsBits.ManageChannels, true) || !appPermissions.has(PermissionFlagsBits.ManageRoles, true)) {
		throw Error('Missing permissions `ManageChannels` or `ManageRoles`');
	}
	// Get eventCategory channel
	const eventCategory = guild.channels.cache.find((c, k) => k === eventCategoryId && c.type === ChannelType.GuildCategory) as CategoryChannel;
	if (!eventCategory) {
		throw Error('Failed to find event channel, please check .env.EVENT_CATEGORY_ID');
	}

	const dateString = fields.getTextInputValue('date').concat('T').concat(fields.getTextInputValue('time'));
	const eventDate = new Date(dateString);

	// Check for an invalid date string
	if (Number.isNaN(eventDate.getTime())) {
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

	// Check that date is not in the future
	if (eventDate.getTime() <= Date.now()) {
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

	// Create Discord event VC
	const eventName = fields.getTextInputValue('name');
	const eventVc = await guild.channels.create({
		name: eventName,
		type: ChannelType.GuildVoice,
		parent: eventCategory,
		permissionOverwrites: basePermissionOverwrites(interaction)
	});

	// Create Discord Event
	const description = fields.getTextInputValue('description');
	const eventOptions: GuildScheduledEventCreateOptions = {
		name: eventName,
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.Voice,
		scheduledStartTime: eventDate,
		channel: eventVc
	};
	if (description.length >= 1) eventOptions.description = description;
	const event = await guild.scheduledEvents.create(eventOptions);

	// Create Event Text Channel
	const eventChat = await guild.channels.create({
		name: eventName,
		type: ChannelType.GuildText,
		topic: `Event ID:${event.id}`,
		parent: eventCategory,
		permissionOverwrites: basePermissionOverwrites(interaction)
	});

	// Reply with Buttons and select menu
	await interaction.reply({
		content: t({
			key: 'event-success-create',
			ns,
			locale
		}),
		components: [
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				eventLinkButton(event.url, locale),
				eventVCLinkButton(eventVc.url, locale),
				eventChatLinkButton(eventChat.url, locale)
			),
			createEventMemberRoleSelectMenu(event.id, locale)
		],
		ephemeral: true
	});

	await EventsDB.create({
		eventID: event.id,
		guildID: event.guildId,
		textID: eventChat.id,
		vcID: event.channelId,
		creatorID: interaction.user.id,
		status: event.status,
		name: event.name,
		description: event.description,
		participants: []
	});
	logger.debug('Event created from Modal window');
});
