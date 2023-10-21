import { vc } from '@execution/vc';
import { localization, t } from '@i18n';
import { ChatInputCommand } from 'discord-client';
import { ChannelType } from 'discord.js';

export const ns = 'vc';

export default new ChatInputCommand()
	.setBuilder((builder) =>
		builder
			.setName(t({ key: 'command-name', ns }))
			.setDescription(t({ key: 'command-description', ns }))
			.setNameLocalizations(localization('command-name', ns))
			.setDescriptionLocalizations(localization('command-description', ns))
			.setDMPermission(false)
			.addSubcommand((subcommand) =>
				subcommand
					.setName(t({ key: 'request-join-name', ns }))
					.setNameLocalizations(localization('request-join-name', ns))
					.setDescription(t({ key: 'request-join-description', ns }))
					.setDescriptionLocalizations(localization('request-join-description', ns))
					.addChannelOption((option) =>
						option
							.setName(t({ key: 'channel-option-name', ns }))
							.setNameLocalizations(localization('channel-option-name', ns))
							.setDescription(t({ key: 'channel-option-description', ns }))
							.setDescriptionLocalizations(localization('channel-option-description', ns))
							.addChannelTypes(ChannelType.GuildVoice)
							.setRequired(false)
					)
			)
	)
	.setExecute(vc);
