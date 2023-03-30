import {
	ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction
} from 'discord.js';
import { hasSMERole, isStateLead } from '../../structures/helpers';
import { ContextMenuCommand } from '../../structures/Command';

export default new ContextMenuCommand({
	// name: 'pin',
	data: new ContextMenuCommandBuilder()
		.setName('Pin Message')
		.setType(ApplicationCommandType.Message),
	execute: async (interaction: MessageContextMenuCommandInteraction<'cached'>) => {
		if (!interaction.targetMessage.pinnable) {
			return interaction.reply({ content: 'I cannot pin this message.', ephemeral: true });
		}

		// TODO: bad error message. if someone uses this outside of a state channel, they have no idea
		if (isStateLead(interaction) !== true && hasSMERole(interaction) !== true) {
			return interaction.reply({ content: 'You must either be a State Lead or have a SME role to use this command', ephemeral: true });
		}

		await interaction.deferReply({ ephemeral: true });

		// TODO: Permissions structure for context menu interactions
		const clientMember = await interaction.guild.members.fetch(interaction.client.user);
		const clientMissingPermissions = interaction.channel.permissionsFor(clientMember).missing(['ManageMessages', 'ReadMessageHistory']);

		if (clientMissingPermissions.length) {
			return interaction.editReply(`I don't have enough permissions: ${clientMissingPermissions.map((p) => `\`${p}\``).join(', ')} to delete this message!`);
		}

		try {
			if (!interaction.targetMessage.pinned) {
				await interaction.targetMessage.pin();
				return interaction.editReply('Message pinned.');
			}

			await interaction.targetMessage.unpin();
			return interaction.editReply('Message unpinned.');
		}
		catch (e) {
			console.error('Error deleting message', e);
			return interaction.editReply('An error occurred while pinning the message.');
		}
	}
});
