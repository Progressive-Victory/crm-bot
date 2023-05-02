import {
	ChannelType,
	PermissionFlagsBits,
	SlashCommandBuilder
} from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('lead')
		.setDescription(
			'Commands for leads to help manage their respective regions'
		)
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels
		)
		.setDMPermission(false)
		.addSubcommandGroup((subcommandGroup) =>
			subcommandGroup
				.setName('region')
				.setDescription('Region Lead utilities')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('role')
						.setDescription('Toggle Regional Lead role')
						.addUserOption((option) =>
							option
								.setName('user')
								.setDescription('Target user')
								.setRequired(true)
						)
				)
		)
		.addSubcommandGroup((subcommandGroup) =>
			subcommandGroup
				.setName('vc')
				.setDescription('Manage voice channels')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('rename')
						.setDescription('Rename organizing voice channels')
						.addChannelOption((options) =>
							options
								.setName('channel')
								.setDescription('The channel to rename')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildVoice)
						)
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('Name to set the channel to')
								.setRequired(true)
								.setAutocomplete(true)
								.setMinLength(5)
								.setMaxLength(100)
						)
				)
		)
};
