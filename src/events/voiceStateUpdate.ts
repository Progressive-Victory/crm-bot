import { Event, logger } from '@progressive-victory/client';
import {
	EventsDB, vcJoins, vcLeaves 
} from '@util/database';
import {
	Events, GuildScheduledEventStatus, VoiceState 
} from 'discord.js';
import { renameOrganizing } from 'src/structures/helpers';

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
	if (newState.guild.id === process.env.TRACKING_GUILD) {
		if (!oldState.channel && newState.channel) {
			await vcJoins.newFromMember(newState.member, newState.channel);
			logger.debug(`Added ${newState.member.id} to the VC join database.`);
		}
		else if (oldState.channel && !newState.channel) {
			await vcLeaves.newFromMember(newState.member, oldState.channel);
			logger.debug(`Added ${newState.member.id} to the VC leave database.`);
		}
		await renameOrganizing(newState.channel || oldState.channel);
	}
	const activeEvent = newState.guild.scheduledEvents.cache.filter((e) => e.status === GuildScheduledEventStatus.Active);
	for (const [eventID, e] of activeEvent) {
		if (newState.channelId === e.channelId) await EventsDB.findOneAndUpdate({ eventID }, { $push: { participants: newState.member.id } });
	}
}

export default new Event().setName(Events.VoiceStateUpdate).setExecute(onVoiceStateUpdate);
