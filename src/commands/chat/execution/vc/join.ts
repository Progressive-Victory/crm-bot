import { ns } from '@builders/vc';
import { t } from '@i18n';
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, VoiceChannel 
} from 'discord.js';

export async function joinRequest(interaction: ChatInputCommandInteraction<'cached'>) {
	const channelOption = interaction.options.getChannel(t({ key: 'channel-option-name', ns }), false, [ChannelType.GuildVoice]);
	const { locale } = interaction;
	if (!channelOption && interaction.channel.type !== ChannelType.GuildVoice) {
		return interaction.reply({
			content: t({
				key: 'invalid-channel',
				ns
			}),
			ephemeral: true
		});
	}

	const requestMessage = {
		content: t({
			key: 'request-to-join',
			locale,
			ns,
			args: { member: interaction.member.toString() }
		}),
		allowedMentions: { users: [] },
		components: [
			new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(`vc_allow_${interaction.user.id}_${interaction.member.voice.channelId}`)
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
						.setCustomId(`vc_reject_${interaction.user.id}_${interaction.member.voice.channelId}`)
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
	};
	let channel: VoiceChannel;
	if (!channelOption && interaction.channel.type === ChannelType.GuildVoice) {
		channel = interaction.channel;
	}
	else {
		channel = channelOption;
	}

	if (channel.userLimit <= channel.members.size) {
		if (interaction.channel === channel) {
			return interaction.reply(requestMessage);
		}
		channel.send(requestMessage);
		return interaction.reply({
			content: t({
				key: 'request-sent',
				locale,
				ns,
				args: { channel: channel.toString() }
			}),
			ephemeral: true
		});
	}

	interaction.member.voice.setChannel(channel);
	return interaction.reply({
		content: t({
			key: 'move-successful',
			ns,
			locale
		}),
		ephemeral: true
	});
}
