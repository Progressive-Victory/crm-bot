import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, InteractionContextType, InteractionReplyOptions, MessageFlags, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { FilterQuery } from "mongoose";
import { ChatInputCommand } from "../../Classes/index.js";
import { warnButtons } from "../../features/moderation/buttons.js";
import { isRightArrowDisabled } from "../../features/moderation/index.js";
import { viewWarningMessageRender } from "../../features/moderation/warningRender.js";
import { Warn, WarningRecord } from "../../models/Warn.js";
import { WarningSearch } from "../../models/WarnSearch.js";
import { AddSplitCustomId } from "../../util/index.js";
// import { localize } from "../../i18n.js";

export const ns = "moderation"

export default new ChatInputCommand({
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
				.setRequired(false)
			)
		)
		.addSubcommand(subCommand => subCommand
			.setName('view')
			.setDescription('View warnings')
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
	const target = interaction.options.getUser('member', true);
	const chatDuration = interaction.options.getInteger('duration')
	const chatReason = interaction.options.getString('reason');

	
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
		.setCustomId(AddSplitCustomId('warn','create', target.id))
		.addComponents(firstActionRow,secondActionRow)
		
	interaction.showModal(model)
}

/**
 * view warning(s)
 * @param interaction command interaction from user
 */
async function viewWarning(interaction: ChatInputCommandInteraction) {
	
	const mod = interaction.options.getUser('issuer') ?? undefined
	const target = interaction.options.getUser('recipient') ?? undefined
	const monthsAgo = interaction.options.getInteger('scope') ?? -1
	const interactionReply: InteractionReplyOptions = {}
	const filter: FilterQuery<WarningRecord> = {}
	let expireAfter: Date | undefined = undefined

	interactionReply.flags = MessageFlags.Ephemeral

	if (monthsAgo === -1) {
		expireAfter = new Date
		filter.expireAt = { $gte: expireAfter };
	}
	else if (monthsAgo > 0) {
		expireAfter = new Date
		expireAfter.setMonth(-monthsAgo)
		filter.expireAt = { $gte: expireAfter };
	}
	if (mod) {
		filter.moderatorDiscordId = mod.id
	}
	if (target) filter.targetDiscordId = target.id

	interaction.deferReply({flags: MessageFlags.Ephemeral })

	const searchRecord = await WarningSearch.create({
		searcherDiscordId: interaction.user.id,
		searcherUsername: interaction.user.username,
		targetDiscordId: target?.id,
		moderatorDiscordId: mod?.id,
		expireAfter,
		pageStart: 0,
	})

	const records = await Warn.find(filter);


    if (records.length == 0) {
        interaction.followUp({ content: `${target} has no active warns or warns in the selected scope`});
        return;
    }
    else if (records.length > 3) {
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				warnButtons.leftButton(searchRecord),
				warnButtons.rightButton(searchRecord, isRightArrowDisabled(searchRecord.pageStart, records.length))
			);
			interactionReply.components = [actionRow]
    }

	interactionReply.embeds = viewWarningMessageRender(records)

    interaction.reply(interactionReply);
}
