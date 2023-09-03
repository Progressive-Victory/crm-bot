import { Interaction } from '@Client';
import { ButtonInteraction, VoiceChannel } from 'discord.js';

export default new Interaction<ButtonInteraction>().setName('vc').setExecute(async (interaction) => {
	const args = interaction.customId.split(interaction.client.splitCustomIDOn);
	const action = args[1];
	const requester = await interaction.guild.members.fetch(args[2]);
	const fromChannel = (await interaction.guild.channels.fetch(args[3])) as VoiceChannel;

	if (!(interaction.channel as VoiceChannel).members.has(interaction.user.id)) {
		interaction.reply({
			content: `You must be in ${interaction.channel} to repliy to this request`,
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
			content: 'This request has exspired',
			components: []
		});
		setTimeout(() => {
			interaction.deleteReply();
		}, 60000);
		return;
	}

	if (!fromChannel.members.has(args[2])) {
		interaction.update({
			content: `${requester} has left the channel`,
			components: [],
			allowedMentions: { users: [] }
		});
		setTimeout(() => {
			interaction.deleteReply();
		}, 60000);
	}

	requester.voice.setChannel(interaction.channel as VoiceChannel);

	interaction.update({
		content: 'Request Accepted',
		components: []
	});
	setTimeout(() => {
		interaction.deleteReply();
	}, 60000);
});
