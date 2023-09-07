import { ns } from '@builders/vc';
import { t } from '@i18n';
import {
	ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, VoiceChannel 
} from 'discord.js';

export async function joinRequest(interaction: ChatInputCommandInteraction<'cached'>) {
	const channelOption = interaction.options.getChannel(t({ key: 'channel-option-name', ns }), false, [ChannelType.GuildVoice]);
	const { locale } = interaction;

	let channel: VoiceChannel;
	// If channel option was not populated the channel where the command was run is used
	if (!channelOption && interaction.channel.type === ChannelType.GuildVoice) {
		channel = interaction.channel;
	}
	else {
		channel = channelOption;
	}

	// checking that target channel is a voice channel this is neeed if the command is run in a text channel with no channel option
	if (!channelOption && interaction.channel.type !== ChannelType.GuildVoice) {
		return interaction.reply({
			content: t({
				key: 'invalid-channel',
				ns
			}),
			ephemeral: true
		});
	}

	// Checks if member runing the command is in a VC
	if (!interaction.member.voice.channel) {
		return interaction.reply({
			content: t({
				key: 'not-in-vc',
				ns,
				locale
			}),
			ephemeral: true
		});
	}

	// checks if the member using the command is already in  the target channel
	if (interaction.channel === channel) {
		return interaction.reply({
			content: t({
				key: 'same-target-destion-channel',
				ns,
				locale
			}),
			ephemeral: true
		});
	}

	// request message sent in target channel with buttons message will not mention the user
	const requestMessage: BaseMessageOptions = {
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

	// Checks that the room is full
	if (channel.userLimit <= channel.members.size) {
		// checks if command was sent from same channel
		if (interaction.channel === channel) {
			return interaction.reply(requestMessage);
		}

		// If sent from different channel request is sent to target channel
		await channel.send(requestMessage);
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

	// If channel is not full member is moved in to channel
	await interaction.member.voice.setChannel(channel);
	return interaction.reply({
		content: t({
			key: 'move-successful',
			ns,
			locale
		}),
		ephemeral: true
	});
}
