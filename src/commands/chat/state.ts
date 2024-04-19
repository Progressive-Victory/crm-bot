import { ChatInputCommand } from 'Classes/index.js';
import { PermissionFlagsBits } from 'discord.js';
import { autoComplete, lead } from 'features/state/index.js';
import { localize } from 'i18n.js';
const { discordLocalizationRecord } = localize;

export const ns = 'state';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('state')
		.setDescription('Commands for state leads to help manage their state')
		.setNameLocalizations(discordLocalizationRecord('lead-name', ns))
		.setDescriptionLocalizations(discordLocalizationRecord('lead-description', ns))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageEvents)
		.setDMPermission(false)
		.addSubcommand((subcommand) => subcommand
			.setName('ping')
			.setDescription('Ping State Role')
			.setNameLocalizations(discordLocalizationRecord('ping-name', ns))
			.setDescriptionLocalizations(discordLocalizationRecord('ping-description', ns))
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('Message you wish to add to the ping')
					.setNameLocalizations(discordLocalizationRecord('ping-message-name', ns))
					.setDescriptionLocalizations(discordLocalizationRecord('ping-message-description', ns))
					.setMaxLength(2000)
					.setRequired(false)
			)
		)
		.addSubcommand((subcommand) => subcommand
			.setName('members')
			.setDescription('Exports a list of the users with a role to a csv file')
			.setNameLocalizations(discordLocalizationRecord('member-list-name', ns))
			.setDescriptionLocalizations(discordLocalizationRecord('member-list-description', ns))
			.addRoleOption((option) => option
				.setName('role')
				.setDescription('The role from which to get list')
				.setNameLocalizations(discordLocalizationRecord('member-list-role-option-name', ns))
				.setDescriptionLocalizations(discordLocalizationRecord('member-list-role-option-description', ns))
				.setRequired(true)
			)
		)
	)
	.setAutocomplete(autoComplete)
	.setExecute(lead);
