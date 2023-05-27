import {
	ApplicationCommandType, MessageContextMenuCommandInteraction, PermissionFlagsBits 
} from 'discord.js';
import { isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../Client';
import Logger from '../../structures/Logger';
import { localization, t } from '../../i18n';

const ns = 'delete';

export default new ContextMenuCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setType(ApplicationCommandType.Message)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
			.setDMPermission(false)
	)
	.setExecute(async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		const { locale } = interaction;
		if (!interaction.targetMessage.deletable) {
			return interaction.reply({
				content: t({
					key: 'CannotDelete',
					locale,
					ns,
					args: { url: interaction.targetMessage.url }
				}),
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
			return interaction.followUp(
				t({
					key: 'Success',
					locale,
					ns,
					args: { url: interaction.targetMessage.url }
				})
			);
		}
		catch (e) {
			Logger.error('Error deleting message', e);
			return interaction.followUp(
				t({
					key: 'Error',
					locale,
					ns,
					args: { url: interaction.targetMessage.url }
				})
			);
		}
	});
