import { ContextMenuCommand, Logger } from '@Client';
import { t } from '@i18n';
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction, PermissionFlagsBits
} from 'discord.js';
import { hasSMERole, isStateLead } from 'src/structures/helpers';

const ns = 'pin';

export default new ContextMenuCommand()
	.setBuilder(
		new ContextMenuCommandBuilder()
			.setName(
				t({
					key: 'command-name',
					ns
				})
			)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ReadMessageHistory)
			.setDMPermission(false)
			.setType(ApplicationCommandType.Message)
	)
	.setExecute(async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		const locale = interaction.guildLocale;
		if (!interaction.targetMessage.pinnable) {
			return interaction.reply({
				content: t({
					key: 'Error',
					locale,
					ns,
					args: { url: interaction.targetMessage.url }
				}),
				ephemeral: true
			});
		}

		const stateLeadCheck = isStateLead(interaction);
		const smeCheck = hasSMERole(interaction);

		if (stateLeadCheck !== true && smeCheck !== true) {
			return interaction.reply({
				ephemeral: true,
				content: `Please resolve one of the two following issues:\n*${stateLeadCheck}*\n\n*${smeCheck}*`
			});
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			if (!interaction.targetMessage.pinned) {
				await interaction.targetMessage.pin('Sate lead pin message command');
				return interaction.followUp(
					t({
						key: 'Success',
						locale,
						ns,
						args: { pinned: '', url: interaction.targetMessage.url }
					})
				);
			}

			await interaction.targetMessage.unpin('Sate lead pin message command');
			return interaction.followUp(
				t({
					key: 'Success',
					locale,
					ns,
					args: { pinned: 'un', url: interaction.targetMessage.url }
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
