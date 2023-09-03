import { Interaction } from '@Client';
import { ButtonInteraction, VoiceChannel } from 'discord.js';

import { ns } from '@builders/vc';
import { t } from '@i18n';

export default new Interaction<ButtonInteraction>().setName('vc').setExecute(async (interaction) => {
	const { locale, guildLocale } = interaction;
	const args = interaction.customId.split(interaction.client.splitCustomIDOn);
	const action = args[1];
	const requester = await interaction.guild.members.fetch(args[2]);
	const fromChannel = (await interaction.guild.channels.fetch(args[3])) as VoiceChannel;

	if (!(interaction.channel as VoiceChannel).members.has(interaction.user.id)) {
		interaction.reply({
			content: t({
				key: 'appover-not-in-channel',
				ns,
				locale,
				args: { channel: interaction.channel.toString() }
			}),
			ephemeral: true
		});
		return;
	}

	if (action === 'reject') {
		interaction.message.delete();
		return;
	}

	const date = new Date();
	date.setMinutes(date.getMinutes() - 10);

	if (interaction.createdAt < date) {
		interaction.update({
			content: t({
				key: 'request-exspired',
				ns,
				locale: guildLocale,
				args: { time: interaction.createdAt.toDiscordString('R') }
			}),
			components: []
		});
		setTimeout(() => {
			interaction.deleteReply();
		}, 60000);
		return;
	}

	if (!fromChannel.members.has(args[2])) {
		interaction.update({
			content: t({
				key: 'requester-not-in-old-channel',
				ns,
				locale: guildLocale,
				args: { member: interaction.member.toString() }
			}),
			components: [],
			allowedMentions: { users: [] }
		});
		setTimeout(() => {
			interaction.deleteReply();
		}, 60000);
	}

	requester.voice.setChannel(interaction.channel as VoiceChannel);

	interaction.update({
		content: t({
			key: 'move-successful',
			ns,
			locale: guildLocale,
			args: { member: interaction.member.toString() }
		}),
		components: []
	});
	setTimeout(() => {
		interaction.deleteReply();
	}, 60000);
});
