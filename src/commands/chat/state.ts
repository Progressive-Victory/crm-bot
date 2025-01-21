import { InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { ChatInputCommand } from '../../Classes/index.js';
import { autoComplete, lead } from '../../features/state/index.js';
import { localize } from '../../i18n.js';

export const ns = 'state';

export default new ChatInputCommand()
	.setBuilder((builder) => builder
		.setName('state')
		.setDescription('Commands for state leads to help manage their state')
		.setNameLocalizations(localize.discordLocalizationRecord('state-name', ns))
		.setDescriptionLocalizations(localize.discordLocalizationRecord('state-description', ns))
		.setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone)
		.setContexts(InteractionContextType.Guild)
		.addSubcommand((subcommand) => subcommand
			.setName('ping')
			.setDescription('Ping State Role')
			.setNameLocalizations(localize.discordLocalizationRecord('ping-name', ns))
			.setDescriptionLocalizations(localize.discordLocalizationRecord('ping-description', ns))
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('Message you wish to add to the ping')
					.setNameLocalizations(localize.discordLocalizationRecord('ping-message-name', ns))
					.setDescriptionLocalizations(localize.discordLocalizationRecord('ping-message-description', ns))
					.setMaxLength(2000)
					.setRequired(false)
			)
		)
		.addSubcommand((subcommand) => subcommand
			.setName('members')
			.setDescription('Exports a list of the users with a role to a csv file')
			.setNameLocalizations(localize.discordLocalizationRecord('member-list-name', ns))
			.setDescriptionLocalizations(localize.discordLocalizationRecord('member-list-description', ns))
			.addRoleOption((option) => option
				.setName('role')
				.setDescription('The role from which to get list')
				.setNameLocalizations(localize.discordLocalizationRecord('member-list-role-option-name', ns))
				.setDescriptionLocalizations(localize.discordLocalizationRecord('member-list-role-option-description', ns))
				.setRequired(true)
			)
		)
	)
	.setAutocomplete(autoComplete)
	.setExecute(lead);
