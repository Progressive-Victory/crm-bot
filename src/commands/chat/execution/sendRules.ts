import {
	ChatInputCommandInteraction,
	TextChannel,
	EmbedBuilder,
	ActionRowBuilder,
	MessageActionRowComponentBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';
import { t } from '../../../i18n';

export async function welcome(interaction: ChatInputCommandInteraction) {
	const channel = interaction.options.getChannel('channel', true);
	if (!(channel instanceof TextChannel)) {
		return interaction.reply({ content: `please use in Text channel`, ephemeral: true });
	}
	console.log(t('command-name-test', interaction.locale, 'comman'));
	await channel.send({
		embeds: [
			new EmbedBuilder()
				.setTitle('Welcome to the Uptime Lab Discord')
				.setDescription('welcome')
				.setColor('Grey')
				.setImage('https://cdn.discordapp.com/attachments/1014458643816661083/1073779941252022313/b681a17ca10c3fa31c05fa2b440e3640.png')
		],
		components: [
			new ActionRowBuilder<MessageActionRowComponentBuilder>()
				.addComponents(new ButtonBuilder().setCustomId('rules').setLabel('Rules').setEmoji('📜').setStyle(ButtonStyle.Primary))
				.addComponents(new ButtonBuilder().setCustomId('socials').setLabel('Socials').setEmoji('🔗').setStyle(ButtonStyle.Secondary))
				.addComponents(new ButtonBuilder().setLabel('Website').setEmoji('🌐').setURL('https://uplab.pro/').setStyle(ButtonStyle.Link))
		]
	});
	return interaction.reply({ content: `messages sent to ${channel}`, ephemeral: true });
}
