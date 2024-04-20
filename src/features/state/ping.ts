import {
	ChannelType, ChatInputCommandInteraction,
	quote
} from 'discord.js';
import { ns } from '../../commands/chat/state.js';
import { localize } from '../../i18n.js';
import {
	getStateFromChannel,
	getStatesFromMember
} from '../../util/states/index.js';

/**
 * Executes the ping command to send a message to a channel.
 * @param interaction - The chat input command interaction object.
 * @returns interaction
 */
export default async function ping(interaction: ChatInputCommandInteraction<'cached'>) {
	const {
		locale, options, guild, member
	} = interaction;
	let { channel } = interaction;
	const local = localize.getLocale(locale);
	const message = options.getString('message');
	// Defer the reply to indicate that the bot is processing the command.
	await interaction.deferReply({ ephemeral: true });
	if( channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread)
		return interaction.followUp({
			content: local.t('ping-no-thread', ns),
			ephemeral: true
		});
	
	const stateFromChannel = getStateFromChannel(channel);
	const statesFromMember = getStatesFromMember(member);
	if(!statesFromMember.includes(stateFromChannel)) 
		return interaction.followUp({
			content: local.t('ping-cant-send', ns, { channel: channel.toString() }),
			ephemeral: true 
		});
	const role = guild.roles.cache.find(r => stateFromChannel.abbreviation === r.name.toLowerCase());
	let temp: string;
	if(message) 
		temp = quote(message) + '\n';
	else 
		temp = '';

	const sent = await channel.send({ content: `${role}\n${temp.toString()}${local.t('ping-sent-by', ns, { user: member.toString() })}` });
	return interaction.followUp({
		content: local.t('ping-success',ns),
		ephemeral: true
	});
	
}
