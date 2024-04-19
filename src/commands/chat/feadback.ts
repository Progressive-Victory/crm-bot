import { ChatInputCommand } from 'Classes/index.js';
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle
} from 'discord.js';
import { localize } from 'i18n.js';

export const ns = 'feadback';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('feadback')
		.setDescription('Find out how to submit feadback about the bot')
		.setNameLocalizations(localize.discordLocalizationRecord('feadback-name', ns))
		.setDescriptionLocalizations(localize.discordLocalizationRecord('feadback-description', ns))
	)
	.setExecute(async (interaction) => {
		interaction.reply({
			content: localize.t('feadback-message', ns, interaction.locale),
			ephemeral: true,
			components: [new ActionRowBuilder<ButtonBuilder>()
				.addComponents(new ButtonBuilder()
					.setLabel(localize.t('feadback-button', ns, interaction.locale))
					.setStyle(ButtonStyle.Link)
					.setURL('https://github.com/Progressive-Victory/crm-bot/issues'))]
		});
	});
