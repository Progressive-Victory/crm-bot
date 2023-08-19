import { Interaction } from '@Client';
import { ButtonInteraction, VoiceChannel } from 'discord.js';

export default new Interaction<ButtonInteraction>().setName('vc').setExecute(async (interaction) => {
	const target = interaction.message.mentions.members.first();
	target.voice.setChannel(interaction.channel as VoiceChannel);
});
