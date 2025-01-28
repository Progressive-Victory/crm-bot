import {
	ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Events, Message, MessageCreateOptions,
	ModalSubmitInteraction, Snowflake, TextChannel, ThreadChannel, TimestampStyles
} from 'discord.js';
import { Interaction } from '../../Classes/Interaction.js';
import { ns } from '../../commands/context_menu/report.js';
import { localize } from '../../i18n.js';
import { client } from '../../index.js';
import { isGuildMember } from '../../util/index.js';


const reportChannelID = process.env.REPORT_CHANNEL_ID;

export default new Interaction<ModalSubmitInteraction>()
	.setCustomIdPrefix('report')
	.setRun(async (interaction) => {
		
		await interaction.reply({ content: 'Your report has been received and will be reviewed', ephemeral: true });

		const {
			guild, customId, client 
		} = interaction;

		if(client.splitCustomIdOn == undefined) throw Error('splitCustomIdOn is undefined');
		if(guild == null) throw Error('interaction not in guild');

		const channel = guild.channels.cache.get(reportChannelID) as ThreadChannel;
		const args = customId.split(client.splitCustomIdOn);
		
		let message: MessageCreateOptions | undefined = { content: bold('Error') };
		
		switch (args[1]) {
			case 'm':
				message = await MessageReport(interaction, args);
				break;
			case 'u':
				message = await userReport(interaction, args);
				break;
			default:
			
				return;
		}
		if(message == undefined) return;
		await channel.send(message);
	});


/**
 *
 * @param interaction
 * @param args
 */
async function userReport(interaction: ModalSubmitInteraction, args: string[]) {
	const {
		guild, fields, member, locale
	} = interaction;
	if(!isGuildMember(member)) {
		interaction.client.emit(Events.Error, Error('received APIInteractionDataResolvedGuildMember when expecting guildMember'));
		await interaction.reply({ content: localize.t('reply_error', ns, locale) });
		return;
	}
	const targetMember = guild?.members.cache.get(args[2]);
	const comment = fields.getTextInputValue('comment') || 'No Additional Comment';
	const embed = new EmbedBuilder()
		.setTitle('User Report')
		.setThumbnail(targetMember.displayAvatarURL({ forceStatic: true, size: 4096 }) ?? null)
		.addFields(
			{
				name: 'Reported', value: targetMember.toString(), inline: true 
			},
			{
				name: 'Reported By', value: member.toString(), inline: true 
			},
			{ name: 'Comment', value: comment })
		.setColor(Colors.Red);
	return { embeds: [embed], components: [reportRow(args[2])] };
}

/**
 *
 * @param interaction
 * @param args
 */
async function MessageReport(interaction: ModalSubmitInteraction, args: string[]): Promise< undefined | MessageCreateOptions> {
    
	const {
		guild, fields, member, locale 
	} = interaction;

	if(!guild ) 
		throw Error();
	
    
	const channel = guild.channels.cache.get(args[2] ) as TextChannel;
	const message = channel.messages.cache.get(args[3]);
    
	if(!isGuildMember(member)) {
		interaction.client.emit(Events.Error, Error('received APIInteractionDataResolvedGuildMember when expecting guildMember'));
		await interaction.reply({ content: localize.t('reply_error', ns, locale) });
		return null;
	}
	const targetMember = guild.members.cache.get(message.author.id);
	const comment = fields.getTextInputValue('comment') || 'No Additional Comment';
	const embed = new EmbedBuilder()
		.setTitle('Message Report')
		.setThumbnail(targetMember?.displayAvatarURL({ forceStatic: true, size: 1024 }) ?? targetMember!.user.avatarURL({ forceStatic: true, size: 1024 }))
		.addFields(
			{
				name: 'Channel', value: channel.toString(), inline: true 
			},
			{
				name: 'Date Posted', value: message!.createdAt.toDiscordString(TimestampStyles.LongDateTime), inline: true 
			},
			{ name: 'Content of Message', value: message!.content },
			{
				name: 'Reported', value: targetMember!.toString(), inline: true 
			},
			{
				name: 'Reported By', value: member.toString(), inline: true 
			},
			{ name: 'Comment', value: comment })
		.setColor(Colors.Red);
	return { embeds: [embed], components: [reportRow(message!.author.id, message)] };
}

/**
 *
 * @param id
 * @param message
 */
function reportRow(id: Snowflake, message?: Message) {
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(inspect.setCustomId(client.arrayToCustomId('inspect', id)));
	if (message) 
		return row.addComponents(link.setURL(message.url));
    
	else 
		return row;
    
}

const inspect = new ButtonBuilder()
	.setLabel('Inspect User')
	.setEmoji('🔎')
	.setStyle(ButtonStyle.Secondary);
const link = new ButtonBuilder()
	.setLabel('Link to Message')
	.setEmoji('🔗')
	.setStyle(ButtonStyle.Link);
