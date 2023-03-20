import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction } from 'discord.js';
import { isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../structures/Command';
import { REGION_ABBREVIATION_MAP } from '../../structures/Constants';

export default new ContextMenuCommand({
	// TODO: Map file name to proper name - such as "delete" to "Delete Message"
	// name: 'delete',
	data: new ContextMenuCommandBuilder()
		.setName('Delete Message')
		.setType(ApplicationCommandType.Message),
	// We don't want to set the default permissions here because this is intended to be a different level of permission management
	execute: async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		if (!interaction.targetMessage.deletable) {
			return interaction.reply({ content: 'I cannot delete this message.', ephemeral: true });
		}

		const str = isStateLead(interaction);
		if (str !== true) return interaction.reply({ content: str, ephemeral: true });

		await interaction.deferReply({ ephemeral: true });

		// TODO: Permissions structure for context menu interactions
		const clientMember = await interaction.guild.members.fetch(interaction.client.user);
		const clientMissingPermissions = interaction.channel.permissionsFor(clientMember).missing(['ManageMessages', 'ReadMessageHistory']);

		if (clientMissingPermissions.length) {
			return interaction.editReply(`I don't have enough permissions: ${clientMissingPermissions.map((p) => `\`${p}\``).join(', ')} to delete this message!`);
		}

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
