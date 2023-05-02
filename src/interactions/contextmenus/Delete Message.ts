import {
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	MessageContextMenuCommandInteraction,
	PermissionFlagsBits
} from 'discord.js';
import Languages from '../../assets/languages';
import { isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../structures/Command';

export default new ContextMenuCommand({
	name: 'Delete Message',
	perms: { client: ['ManageMessages', 'ReadMessageHistory'] },
	// TODO: Map file name to proper name - such as "delete" to "Delete Message"
	// name: 'delete',
	data: new ContextMenuCommandBuilder()
		.setName('Delete Message')
		.setType(ApplicationCommandType.Message)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	execute: async (
		interaction: MessageContextMenuCommandInteraction<'cached'>
	) => {
		const language = Languages[interaction.language].Commands.Delete;

		if (!interaction.targetMessage.deletable) {
			return interaction.reply({
				content: language.CannotDelete(interaction.targetMessage),
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
			return interaction.editReply(
				language.Success(interaction.targetMessage)
			);
		}
		catch (e) {
			console.error('Error deleting message', e);
			return interaction.editReply(
				language.Error(interaction.targetMessage)
			);
		}
	}
});
