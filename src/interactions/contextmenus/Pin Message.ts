import {
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	MessageContextMenuCommandInteraction
} from 'discord.js';
import { hasSMERole, isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../structures/Command';
import Languages from '../../assets/languages';

export default new ContextMenuCommand({
	name: 'Pin Message',
	perms: { client: ['ManageMessages', 'ReadMessageHistory'] },
	// name: 'pin',
	data: new ContextMenuCommandBuilder()
		.setName('Pin Message')
		.setType(ApplicationCommandType.Message),
	execute: async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		const language = Languages[interaction.language].Commands.Pin;

		if (!interaction.targetMessage.pinnable) {
			return interaction.reply({ content: language.CannotPin(interaction.targetMessage), ephemeral: true });
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
				await interaction.targetMessage.pin();
				return interaction.editReply(language.Success(interaction.targetMessage, true));
			}

			await interaction.targetMessage.unpin();
			return interaction.editReply(language.Success(interaction.targetMessage, false));
		}
		catch (e) {
			console.error('Error deleting message', e);
			return interaction.editReply(language.Error(interaction.targetMessage));
		}
	}
});
