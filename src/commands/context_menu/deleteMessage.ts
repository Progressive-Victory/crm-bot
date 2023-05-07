import {
	ApplicationCommandType, Locale, MessageContextMenuCommandInteraction, PermissionFlagsBits 
} from 'discord.js';
import { isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../Client';
import Logger from '../../structures/Logger';
import { t } from '../../i18n';

const locale = Locale.EnglishUS;
const ns = 'delete';

export default new ContextMenuCommand()
	.setBuilder((builder) =>
		builder
			.setName(t('command-name', locale, ns))
			.setType(ApplicationCommandType.Message)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
			.setDMPermission(false)
	)
	.setExecute(async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		if (!interaction.targetMessage.deletable) {
			return interaction.reply({
				content: t('CannotDelete', interaction.locale, ns, { url: interaction.targetMessage.url }),
				ephemeral: true
			});
		}

		const str = isStateLead(interaction);
		if (str !== true) {
			return interaction.reply({ content: str, ephemeral: true });
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			await interaction.targetMessage.delete();
			return interaction.followUp(t('Success', interaction.locale, ns, { url: interaction.targetMessage.url }));
		}
		catch (e) {
			Logger.error('Error deleting message', e);
			return interaction.followUp(t('Error', interaction.locale, ns, { url: interaction.targetMessage.url }));
		}
	});
