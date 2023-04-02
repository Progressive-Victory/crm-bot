import {
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	MessageContextMenuCommandInteraction,
	PermissionFlagsBits
} from 'discord.js';
import { isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../structures/Command';
import { REGION_ABBREVIATION_MAP } from '../../structures/Constants';

export default new ContextMenuCommand({
	name: 'Delete Message',
	perms: { client: ['ManageMessages', 'ReadMessageHistory'] },
	// TODO: Map file name to proper name - such as "delete" to "Delete Message"
	// name: 'delete',
	data: new ContextMenuCommandBuilder()
		.setName('Delete Message')
		.setType(ApplicationCommandType.Message)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	execute: async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		if (!interaction.targetMessage.deletable) {
			return interaction.reply({ content: 'I cannot delete this message.', ephemeral: true });
		}

		const str = isStateLead(interaction);
		if (str !== true) {
			return interaction.reply({ content: str, ephemeral: true });
		}

		await interaction.deferReply({ ephemeral: true });

		if (!interaction.member.roles.cache.some((r) => r.name === (REGION_ABBREVIATION_MAP[interaction.targetMessage.channel.name]))) {
			return interaction.editReply('You cannot delete messages from other regions.');
		}

		try {
			await interaction.targetMessage.delete();
			return interaction.editReply('Message deleted.');
		}
		catch (e) {
			console.error('Error deleting message', e);
			return interaction.editReply('An error occurred while deleting the message.');
		}
	}
});
