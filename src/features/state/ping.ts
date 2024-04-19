import { ns } from 'commands/chat/state.js';
import { ChannelType, ChatInputCommandInteraction } from 'discord.js';
import { localize } from 'i18n.js';
import {
	getStateFromChannel,
	getStatesFromMember
} from 'util/states/index.js';

/**
 * Executes the ping command to send a message to a channel.
 * @param interaction - The chat input command interaction object.
 * @returns interaction
 */
export default async function ping(interaction: ChatInputCommandInteraction<'cached'>) {
	const {
		locale, options, guild, member, deferReply, followUp
	} = interaction;
	let { channel } = interaction;
	const { t } = localize.getLocale(locale);
	const message = options.getString('message');
	// Defer the reply to indicate that the bot is processing the command.
	await deferReply({ ephemeral: true });
	if( channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread)
		return followUp({
			content: t('ping-no-thread', ns),
			ephemeral: true
		});
	
	const stateFromChannel = getStateFromChannel(channel);
	const statesFromMember = getStatesFromMember(member);
	if(!statesFromMember.includes(stateFromChannel)) 
		return followUp({
			content: t('ping-cant-send', ns, { channel: channel.toString() }),
			ephemeral: true 
		});
	const role = guild.roles.cache.find(r => stateFromChannel.abbreviation === r.name.toLowerCase());

	const sent = await channel.send({
		content: t('ping-sent-by', ns, {
			role: role.toString(),
			message,
			user: member.toString()
		})
	});
	return followUp({
		content: t('ping-succes',ns, { url: sent.url }),
		ephemeral: true
	});
	
}
