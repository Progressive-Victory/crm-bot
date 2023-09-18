import {
	Message, NewsChannel, StageChannel, TextChannel, ThreadChannel, VoiceChannel 
} from 'discord.js';

export async function fetchAllMessages(channel: TextChannel | VoiceChannel | StageChannel | ThreadChannel | NewsChannel) {
	const messages: Message<true>[] = [];

	// Create message pointer
	let message = (await channel.messages.fetch({ limit: 1, cache: false })).first();
	messages.push(message);
	while (message) {
		const messagesbatch = await channel.messages.fetch({
			limit: 100,
			cache: false,
			before: message.id
		});
		messagesbatch.forEach((msg) => messages.push(msg));

		// Update our message pointer to be the last message on the page of messages
		message = messagesbatch.size > 0 ? messagesbatch.at(messagesbatch.size - 1) : null;
	}
	return messages;
}

export function messageArryToBuffer(messages: Message<true>[]) {
	return Buffer.from(messages.map((m) => `|${m.createdAt.toUTCString()}| ${m.author.username}: ${m.content}`).join('\n=============================\n'));
}
