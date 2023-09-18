import {
	AttachmentBuilder, NewsChannel, StageChannel, TextChannel, ThreadChannel, VoiceChannel 
} from 'discord.js';
import { fetchAllMessages, messageArryToBuffer } from './log-all-messages';

export { fetchAllMessages, messageArryToBuffer } from './log-all-messages';

export async function channelMessgesToAttachmentBuilder(channel: TextChannel | VoiceChannel | StageChannel | ThreadChannel | NewsChannel) {
	return new AttachmentBuilder(messageArryToBuffer(await fetchAllMessages(channel)), { name: `${channel.name.replace(' ', '-').toLowerCase()}-message-log.txt}` });
}
