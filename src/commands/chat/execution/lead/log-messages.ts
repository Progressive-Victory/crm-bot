import { ns } from '@builders/lead';
import { t } from '@i18n';
import { channelMessagesToAttachmentBuilder } from '@util/channel';
import { ChannelType, ChatInputCommandInteraction } from 'discord.js';

export default async function logMessages(interaction: ChatInputCommandInteraction) {
	const { locale, options } = interaction;

	const channel =
		options.getChannel('channel', false, [
			ChannelType.GuildText,
			ChannelType.GuildVoice,
			ChannelType.GuildStageVoice,
			ChannelType.PublicThread,
			ChannelType.PrivateThread
		]) || interaction.channel;

	await interaction.reply({
		content: t({
			key: 'Log Generated',
			ns,
			locale
		}),
		files: [await channelMessagesToAttachmentBuilder(channel)],
		ephemeral: true
	});
}
