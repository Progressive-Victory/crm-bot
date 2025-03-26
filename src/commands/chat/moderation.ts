import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, InteractionContextType, InteractionReplyOptions, MessageFlags, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { FilterQuery } from "mongoose";
import { ChatInputCommand } from "../../Classes/index.js";
import { updatedByIdButton, viewUserWarns } from "../../features/moderation/buttons.js";
import { viewWarningMessageRender, warnSearch } from "../../features/moderation/WarnEmbed.js";
import { Warn, WarningRecord } from "../../models/Warn.js";
import { WarningSearch } from "../../models/WarnSearch.js";
import { AddSplitCustomId, isGuildMember } from "../../util/index.js";
// import { localize } from "../../i18n.js";

export const ns = "moderation"

export const warn = new ChatInputCommand({
	builder: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Moderation commands')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommand(subCommand => subCommand
			.setName('create')
			.setDescription('Add warning to a member')
			.addUserOption(option => option
				.setName('member')
				.setDescription('The member that will receive the warning')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('reason')
				.setDescription('Add reason for the warning')
				.setRequired(false)
			)
			.addIntegerOption(option => option
				.setName('duration')
				.setDescription('Number of days, the warning till end of the warn')
				.setMinValue(0)
				.setMaxValue(999)
				.setRequired(false)
			)
		)
		.addSubcommand(subCommand => subCommand
			.setName('view')
			.setDescription('View warnings')
			.addStringOption(option => option
				.setName('id')
				.setDescription('Search by Record Id. Overrides other search options')
				.setMinLength(24)
				.setRequired(false)
			)
			.addUserOption(option => option
				.setName('recipient')
				.setDescription('Filter be the member who received the warning')
				.setRequired(false)
			)
			.addUserOption(option => option
				.setName('issuer')
				.setDescription('Filter be the member who issued the warning')
				.setRequired(false)
			)
			.addIntegerOption(option => option
				.setName('scope')
				.setDescription('Filter warnings by date issued the last x months')
				.addChoices(
					{ name: 'All', value: 0 },
					{ name: '3 Months', value: 3 },
					{ name: '6 Months', value: 6 },
					{ name: '9 Months', value: 9 },
					{ name: '1 year', value: 12 }
				)
				.setRequired(false)
			)
		),
	execute: async (interaction) => {
		const subcommand = interaction.options.getSubcommand(true)

		switch (subcommand) {
			case 'create':
				chatAdd(interaction)
				break;
			case 'view':
				viewWarning(interaction)
				break;
			default:
				throw Error('Unexpected Warn subcommand')
		}

		return undefined
	}
})

/**
 * Send model to add warning to user
 * @param interaction command interaction from user
 */
function chatAdd(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getMember('member');
	if (!isGuildMember(target)) return
	const chatDuration = interaction.options.getInteger('duration')
	const chatReason = interaction.options.getString('reason');
	if (target == interaction.member) {
		interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: 'You can not warn your self'
		})
		return
	}
	else if (target.user.bot) {
		interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: 'You can not issue a warning to a bot'
		})
		return
	} else if(target.permissions.has("ManageGuild", true)) {
		interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: 'You can not issue a warning to Admin'
		})
		return
	}
	
	const reason = new TextInputBuilder()
		.setCustomId('reason')
		.setLabel('Reason for issuing this warning')
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true)

	if(chatReason)
		reason.setValue(chatReason)

	const duration = new TextInputBuilder()
		.setCustomId('duration')
		.setLabel('Number of days till warning expires')
		.setPlaceholder('90')
		.setMinLength(1)
		.setMaxLength(3)
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
	
		if(chatDuration)
			duration.setValue(chatDuration.toString())

	const firstActionRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(reason)
	const secondActionRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(duration)

	const model = new ModalBuilder()
		.setTitle('Create Warning')
		.setCustomId(AddSplitCustomId('wc', target.id))
		.addComponents(firstActionRow,secondActionRow)
		
	interaction.showModal(model)
}

/**
 * view warning(s)
 * @param interaction command interaction from user
 */
async function viewWarning(interaction: ChatInputCommandInteraction) {

	const mod = interaction.options.getUser('issuer')
	const target = interaction.options.getUser('recipient')
	const monthsAgo = interaction.options.getInteger('scope') ?? -1
	const id = interaction.options.getString('id')
	const filter: FilterQuery<WarningRecord> = {}

	if (id) {
		const warning = await Warn.findById(id)
		if (warning) {
			const embeds = await viewWarningMessageRender([warning])
			const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(updatedByIdButton(warning), viewUserWarns(warning.target.username))
			interaction.reply({
				flags: MessageFlags.Ephemeral,
				embeds,
				components:[actionRow]
			})
			return
		} else if(!mod && !target && monthsAgo === -1) {
			
			interaction.reply({
				flags: MessageFlags.Ephemeral,
				content: 'No search record found. Please let an admin know if you see this message'
			})
			return
		}
	}




	let expireAfter: Date | undefined = undefined
	
	if (monthsAgo === -1) {
		expireAfter = new Date
		filter.expireAt = { $gte: expireAfter };
	}
	else if (monthsAgo > 0) {
		expireAfter = new Date
		expireAfter.setMonth(-monthsAgo)
		filter.expireAt = { $gte: expireAfter };
	}

	const searchRecord = await WarningSearch.create({
		guildId: interaction.guild?.id,
		searcher: {
			discordId: interaction.user.id,
			username: interaction.user.username
		},
		targetDiscordId: target?.id ,
		moderatorDiscordId: mod?.id ,
		expireAfter,
		pageStart: 0,
	})

	const reply: InteractionReplyOptions = await warnSearch(searchRecord,undefined, true)
	reply.flags = MessageFlags.Ephemeral
	
    interaction.reply(reply);
}
