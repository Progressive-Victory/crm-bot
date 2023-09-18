import {
	AttachmentBuilder, Collection, Message, NewsChannel, PermissionFlagsBits, StageChannel, TextChannel, ThreadChannel, VoiceChannel 
} from 'discord.js';

async function fetchAllMessages(channel: TextChannel | VoiceChannel | StageChannel | ThreadChannel | NewsChannel) {
	if (channel.permissionsFor(channel.guild.members.cache.get(channel.client.user.id)).has(PermissionFlagsBits.ReadMessageHistory)) {
		throw Error(`Bot missing Premision \`ReadMessageHistory\` in ${channel.name}`); 
	}

	let messages = new Collection<string, Message<true>>();

	// Create message pointer
	let message = (await channel.messages.fetch({ limit: 1, cache: false })).first();
	messages.set(message.id, message);

	while (message) {
		const messagesbatch = await channel.messages.fetch({
			limit: 100,
			cache: false,
			before: message.id
		});
		messages = messages.concat(messagesbatch);

		// Update our message pointer to be the last message on the page of messages
		message = messagesbatch.size > 0 ? messagesbatch.at(messagesbatch.size - 1) : null;
	}
	return messages;
}

function messageArryToBuffer(messages: Collection<string, Message<true>>) {
	return Buffer.from(messages.map((m) => `|${m.createdAt.toUTCString()}| ${m.author.username}: ${m.content}`).join('\n=============================\n'));
}

export async function channelMessgesToAttachmentBuilder(channel: TextChannel | VoiceChannel | StageChannel | ThreadChannel | NewsChannel) {
	return new AttachmentBuilder(messageArryToBuffer(await fetchAllMessages(channel)), { name: `${channel.name.replace(' ', '-').toLowerCase()}-message-log.txt}` });
}
