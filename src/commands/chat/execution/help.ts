import { ChatInputCommandInteraction } from 'discord.js';
import { t } from 'src/i18n';
import { ns } from '../builders/help';

export async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
	interaction.reply({
		ephemeral: true,
		content: t({
			key: 'comming-soon',
			locale: interaction.locale,
			ns
		})
	});
}
