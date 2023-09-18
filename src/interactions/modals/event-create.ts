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
	// check bot premistions
	if (!appPermissions.has(PermissionFlagsBits.ManageChannels, true) || !appPermissions.has(PermissionFlagsBits.ManageRoles, true)) {
		throw Error('Missing premisions `ManageChannels` or `ManageRoles`'); 
	}
	const eventCategory = guild.channels.cache.find((c, k) => k === eventCategoryId && c.type === ChannelType.GuildCategory) as CategoryChannel;
	if (!eventCategory) {
		throw Error('Faild to find Event Channel Please check .env.EVENT_CATEGORY_ID');
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

	const eventName = fields.getTextInputValue('name');
	const eventVc = await guild.channels.create({
		name: eventName,
		type: ChannelType.GuildVoice,
		parent: eventCategory
	});

	// create event
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
