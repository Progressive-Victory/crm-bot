import { ns } from '@builders/vc';
import { t } from '@i18n';
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, VoiceChannel 
} from 'discord.js';

export async function joinRequest(interaction: ChatInputCommandInteraction<'cached'>) {
	const channelOption = interaction.options.getChannel(t({ key: 'channel-option-name', ns }), false, [ChannelType.GuildVoice]);
	if (!channelOption && interaction.channel.type !== ChannelType.GuildVoice) {
		return interaction.reply({
			content: t({
				key: 'invalid-channel',
				ns
			}),
			ephemeral: true
		});
	}
	let channel: VoiceChannel;
	if (!channelOption && interaction.channel.type === ChannelType.GuildVoice) {
		channel = interaction.channel;
	}
	else if (channelOption) {
		channel = channelOption;
	}
	return channel.send({
		content: t({
			key: 'request-to-join',
			ns,
			args: { member: interaction.member.toString() }
		}),
		allowedMentions: { users: [] },
		components: [
			new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('vc_allow')
						.setStyle(ButtonStyle.Success)
						.setLabel(
							t({
								key: 'vc-allow',
								ns,
								locale: interaction.guildLocale
							})
						)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('vc_reject')
						.setStyle(ButtonStyle.Danger)
						.setLabel(
							t({
								key: 'vc-reject',
								ns,
								locale: interaction.guildLocale
							})
						)
				)
		]
	});
}
