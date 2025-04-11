import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle,
	MessageFlags
} from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { localize } from '../../i18n.js';

export const ns = 'feedback';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('feedback')
		.setDescription('Find out how to submit feedback about the bot')
		.setNameLocalizations(localize.discordLocalizationRecord('feedback-name', ns))
		.setDescriptionLocalizations(localize.discordLocalizationRecord('feedback-description', ns))
	)
	.setExecute(async (interaction) => {
		await interaction.reply({
			content: localize.t('feedback-message', ns, interaction.locale),
			flags: MessageFlags.Ephemeral,
			components: [new ActionRowBuilder<ButtonBuilder>()
				.addComponents(new ButtonBuilder()
					.setLabel(localize.t('feedback-button', ns, interaction.locale) ?? 'Feedback')
					.setEmoji('📝')
					.setStyle(ButtonStyle.Link)
					.setURL('https://github.com/Progressive-Victory/crm-bot/issues'))]
		});
	});
