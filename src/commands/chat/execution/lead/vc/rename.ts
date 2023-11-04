import { ns } from '@builders/lead';
import { t } from '@i18n';
import { logger } from '@progressive-victory/client';
import {
	ChatInputCommandInteraction, PermissionFlagsBits, Snowflake, VoiceChannel 
} from 'discord.js';
import { VCChannelIDs } from 'src/structures/Constants';

/**
 * Renames a VC
 * @param interaction command interaction
 * @returns interaction response
 */
export default async function rename(interaction: ChatInputCommandInteraction<'cached'>) {
	const channel = interaction.options.getChannel('channel', true) as VoiceChannel;
	await interaction.deferReply({ ephemeral: true });

	let content: string;
	const allowedChannels: Snowflake[] = VCChannelIDs;
	const name = interaction.options.getString('name', true);
	const { locale } = interaction;

	if (!allowedChannels.includes(channel.id)) {
		content = t({
			key: 'vc-rename-wrong-channel',
			locale,
			ns,
			args: {
				channel: channel.toString(),
				channels: `${allowedChannels.map((id) => `<#${id}>`).join(', ')}`
			}
		});
	}
	else {
		const reason = t({
			key: 'vc-rename-Audit-Log-Rename',
			locale,
			ns,
			args: {
				name: channel.name,
				tag: interaction.user.tag
			}
		});

		if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageChannels)) {
			return interaction.followUp({
				content: t({
					key: 'vc-rename-permissions',
					locale,
					ns,
					args: { channel: channel.toString() }
				})
			});
		}

		try {
			await channel.setName(name, reason);
		}
		catch (err) {
			logger.error(err, ' could not rename channel');
			return interaction.followUp({
				content: t({
					key: 'vc-rename-error',
					locale,
					ns,
					args: { channel: channel.toString() }
				})
			});
		}

		content = t({
			key: 'vc-rename-success',
			locale,
			ns,
			args: { channel: channel.toString() }
		});
	}

	return interaction.followUp({ content });
}
