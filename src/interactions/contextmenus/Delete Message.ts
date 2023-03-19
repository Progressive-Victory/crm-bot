import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction } from 'discord.js';
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

		if (interaction.guild.id !== process.env.TRACKING_GUILD) {
			return interaction.reply({ content: 'This command can only be used in the tracking server.', ephemeral: true });
		}

		if (!process.env.STATE_LEAD_ROLE_ID) {
			return interaction.reply({ content: 'State lead is missing from the configuration.', ephemeral: true });
		}

		if (!interaction.member.roles.cache.has(process.env.STATE_LEAD_ROLE_ID)) {
			return interaction.reply({ content: `You must have <@&${process.env.STATE_LEAD_ROLE_ID}> to use this command.`, ephemeral: true });
		}

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
