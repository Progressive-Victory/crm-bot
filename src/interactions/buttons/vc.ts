import { Interaction, logger } from 'discord-client';
import { ButtonInteraction, VoiceChannel } from 'discord.js';

import { ns } from '@builders/vc';
import { FluentVariable } from '@fluent/bundle';
import { t } from '@i18n';

/**
 * Deletes message after a minute
 * @param interaction button interaction
 */
function deleteMessage(interaction: ButtonInteraction) {
	setTimeout(() => {
		interaction.deleteReply().catch((err) => logger.error(err));
	}, 60000);
}

/**
 * Updates button interactions
 * @param interaction button interaction wich to update
 * @param key i18n key string
 * @param args flunet arguments
 */
async function updateInteraction(interaction: ButtonInteraction, key: string, args?: Record<string, FluentVariable>) {
	await interaction.update({
		content: t({
			key,
			ns,
			locale: interaction.guildLocale,
			args
		}),
		allowedMentions: { users: [] },
		components: []
	});
	deleteMessage(interaction);
}

export default new Interaction<ButtonInteraction>().setName('vc').setExecute(async (interaction) => {
	const { locale } = interaction;
	const args = interaction.customId.split(interaction.client.splitCustomIDOn);
	const action = args[1];
	const requester = await interaction.guild.members.fetch(args[2]);
	const fromChannel = (await interaction.guild.channels.fetch(args[3])) as VoiceChannel;

	// checks if user responding to request is in the channel
	if (!(interaction.channel as VoiceChannel).members.has(interaction.user.id)) {
		await interaction.reply({
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

	// if message is rejected request is deleted
	if (action === 'reject') {
		await interaction.message.delete();
		return;
	}

	// checks if the request was made more that 10 minutes ago
	const date = new Date();
	date.setMinutes(date.getMinutes() - 10);

	if (interaction.createdAt < date) {
		await updateInteraction(interaction, 'request-exspired', { time: interaction.createdAt.toDiscordString('R') });
		return;
	}

	// checks to see if the requester is still in the channel that they were when the request was mad
	if (!fromChannel.members.has(args[2])) {
		await updateInteraction(interaction, 'requester-not-in-old-channel', { member: interaction.member.toString() });
		return;
	}

	// move member into requested channel
	await requester.voice.setChannel(interaction.channel as VoiceChannel);

	// update message to indicat task was completed
	await updateInteraction(interaction, 'move-successful', { member: interaction.member.toString() });
});
