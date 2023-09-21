import { Interaction } from '@Client';
import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	createEventMemberaRoleSelectMenu, eventChatLinkButton, eventLinkButton, eventVCLinkButton 
} from '@util/event';
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

const dateValidation = /^([2][0-9]{3})-(0[0-9]|1[0-2])-(0[0-9]|[12]\d|3[01])T([01][0-9]|2[0-3]):([0-5][0-9])/g;
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

	// Check that date is valid
	const dateString = fields.getTextInputValue('date').concat('T').concat(fields.getTextInputValue('time'));
	if (!dateValidation.test(dateString)) {
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

	// Check that date is in the future
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

	const permissionOverwrites = [
		{
			id: guild.client.user.id,
			allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels]
		}
	];

	// Create Discord event VC
	const eventName = fields.getTextInputValue('name');
	const eventVc = await guild.channels.create({
		name: eventName,
		type: ChannelType.GuildVoice,
		parent: eventCategory,
		permissionOverwrites
	});

	// Create Discord Event
	const description = fields.getTextInputValue('description');
	const eventOptions: GuildScheduledEventCreateOptions = {
		name: eventName,
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.Voice,
		scheduledStartTime: eventdate,
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
		permissionOverwrites
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
			createEventMemberaRoleSelectMenu(event.id, locale)
		],
		ephemeral: true
	});
});
