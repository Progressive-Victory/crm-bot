import {
	AttachmentBuilder, Collection, Message, NewsChannel, PermissionFlagsBits, StageChannel, TextChannel, ThreadChannel, VoiceChannel 
} from 'discord.js';

/**
 * Fetch All Messages in a channel
 * @param channel
 * @returns Collection of message objects
 */
async function fetchAllMessages(channel: TextChannel | VoiceChannel | StageChannel | ThreadChannel | NewsChannel) {
	// Check for permissions to read the history in requested channel
	if (!channel.permissionsFor(channel.guild.members.cache.get(channel.client.user.id)).has(PermissionFlagsBits.ReadMessageHistory)) {
		throw Error(`Bot missing permissions \`ReadMessageHistory\` in ${channel.name}`);
	}

	let messages = new Collection<string, Message<true>>();

	// Create message pointer
	let message = (await channel.messages.fetch({ limit: 1, cache: false })).first();
	// add the first message to the collection
	if (message) messages.set(message.id, message);

	while (message) {
		// Fetch next 100 messages
		const messagesbatch = await channel.messages.fetch({
			limit: 100,
			cache: false,
			before: message.id
		});
		// Add new messages to the collection
		messages = messages.concat(messagesbatch);

		// Update our message pointer to be the last message on the page of messages
		message = messagesbatch.size > 0 ? messagesbatch.at(messagesbatch.size - 1) : null;
	}
	return messages;
}

/**
 *
 * @param channel target channel
 * @returns AttachmentBuilder with txt file
 */
export async function channelMessagesToAttachmentBuilder(channel: TextChannel | VoiceChannel | StageChannel | ThreadChannel | NewsChannel) {
	const messages = await fetchAllMessages(channel);
	if (!messages.size) return null;
	return new AttachmentBuilder(
		Buffer.from(messages.map((m) => `|${m.createdAt.toUTCString()}| ${m.author.username}: ${m.content}`).join('\n=============================\n')),
		{ name: `${channel.name.replace(' ', '-').toLowerCase()}-message-log.txt}` }
	);
}
