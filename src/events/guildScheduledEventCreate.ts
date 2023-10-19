import { Event, Logger } from '@Client';
import { EventsDB } from '@util/Database';
import { Events, GuildScheduledEvent } from 'discord.js';

async function execute(guildScheduledEvent: GuildScheduledEvent) {
	const {
		id, guildId, creatorId, channelId, name, description 
	} = guildScheduledEvent;

	setTimeout(async () => {
		const exsiting = await EventsDB.findOne({ eventID: id });
		if (!exsiting) {
			Logger.debug('Event created out side of command');
			await EventsDB.create({
				eventID: id,
				guildID: guildId,
				creatorID: creatorId,
				vcID: channelId,
				name,
				description,
				participants: []
			});
		}
	}, 1000);
}

export default new Event().setName(Events.GuildScheduledEventCreate).setExecute(execute);
