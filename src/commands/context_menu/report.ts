import {
	ActionRowBuilder,
	ApplicationCommandType, InteractionContextType, Locale, MessageContextMenuCommandInteraction, ModalBuilder, PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	UserContextMenuCommandInteraction
} from 'discord.js';
import { ContextMenuCommand } from '../../Classes/index.js';
import { localize } from '../../i18n.js';
import { client } from '../../index.js';

export const ns = 'report';

export const reportMessage = new ContextMenuCommand<MessageContextMenuCommandInteraction>()
	.setBuilder((builder) => builder
		.setName('Report Message')
		.setNameLocalizations(localize.discordLocalizationRecord('report_message_name', ns))
		.setType(ApplicationCommandType.Message)
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages))
	.setExecute( async (interaction: MessageContextMenuCommandInteraction) => {

		const { targetMessage, locale } = interaction;

		if (targetMessage.author.system || targetMessage.author.bot) 
			return interaction.reply({ content: localize.t('reply_bot_message', ns, locale), ephemeral: true });
		
		return interaction.showModal(
			reportModal(locale, interaction.client.arrayToCustomId('report', 'm', targetMessage.channelId, targetMessage.id))
		);

	});

export const reportUser = new ContextMenuCommand<UserContextMenuCommandInteraction>()
	.setBuilder((builder) => builder
		.setName('Report User')
		.setNameLocalizations(localize.discordLocalizationRecord('report_user_name', ns))
		.setType(ApplicationCommandType.User)
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages))
	.setExecute(async (interaction: UserContextMenuCommandInteraction) => {
		
		const { targetUser, locale } = interaction;

		if (targetUser.system || targetUser.bot) 
			return interaction.reply({ content: localize.t('reply_bot_user', ns, locale), ephemeral: true });
		
		return interaction.showModal(reportModal(locale, client.arrayToCustomId('report', 'u', targetUser.id)));
	});


/**
 * Generate a report model
 * @param locale localization string
 * @param customId customId used to identify the interaction
 * @returns modal object
 */
export function reportModal(locale: Locale, customId: string){

	return new ModalBuilder()
		.setTitle(localize.t('model_title', ns, locale)!)
		.setCustomId(customId)
		.setComponents(
			new ActionRowBuilder<TextInputBuilder>()
				.setComponents(
					new TextInputBuilder()
						.setCustomId('comment')
						.setLabel(localize.t('model_comment_label', ns, locale)!)
						.setPlaceholder(localize.t('model_comment_placeholder', ns, locale)!)
						.setMaxLength(1000)
						.setRequired(false)
						.setStyle(TextInputStyle.Paragraph))
		);
}
