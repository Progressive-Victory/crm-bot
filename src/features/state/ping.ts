import {
	ChannelType, ChatInputCommandInteraction,
	quote
} from 'discord.js';
import { ns } from '../../commands/chat/state.js';
import { localize } from '../../i18n.js';
import { getStateFromChannel } from '../../util/states/index.js';

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

	// checks to see if the command is being used in a thread
	if( channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread)
		return interaction.followUp({
			content: local.t('ping-no-thread', ns),
			ephemeral: true
		});
	
	const stateFromChannel = getStateFromChannel(channel);

	const role = guild.roles.cache.find(r => stateFromChannel.abbreviation === r.name.toLowerCase());

	// check to see if the person trying to use the command has the role being pinged
	if(!member.roles.cache.has(role.id)) 
		return interaction.followUp({
			content: local.t('WrongRegionChannel', 'common', { channel: channel.toString() }),
			ephemeral: true 
		});
	
	
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
