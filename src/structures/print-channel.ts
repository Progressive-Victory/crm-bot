import {
	AttachmentBuilder, ChannelType, Collection, Message, TextChannel, VoiceChannel 
} from 'discord.js';

async function fetchAllMessages(channel: TextChannel | VoiceChannel) {
	const messages = new Collection<string, Message<true>>();

	// Create message pointer
	let message = await channel.messages.fetch({ limit: 1 }).then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

	while (message) {
		const messagePage = await channel.messages.fetch({ limit: 100, before: message.id });
		messages.concat(messagePage);

		// Update our message pointer to be the last message on the page of messages
		message = messagePage.size > 0 ? messagePage.at(messagePage.size - 1) : null;
	}
	return messages;
}

export async function printChannel(channel: TextChannel | VoiceChannel) {
	const messages = await fetchAllMessages(channel);
	return new AttachmentBuilder(
		Buffer.from(`${messages.map((mes) => `${mes.createdAt.toUTCString()} ${mes.author.username}: ${mes.content}\n\n`).join('')}`)
	).setName(`${channel.name.replace(' ', '-')}-${channel.type === ChannelType.GuildText ? 'chat' : 'vc'}.txt`);
}
