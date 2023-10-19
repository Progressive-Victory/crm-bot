import { Logger } from '@Client';
import {
	GuildScheduledEventManager, GuildScheduledEventStatus, Snowflake 
} from 'discord.js';
import {
	Model, Schema, model 
} from 'mongoose';

export interface IEvent {
	eventID: Snowflake;
	creatorID: Snowflake;
	guildID: Snowflake;
	textID?: Snowflake;
	vcID?: Snowflake;
	name: string;
	description?: string;
	status: GuildScheduledEventStatus;
	participants: Snowflake[];
}

const eventSchema = new Schema<IEvent>(
	{
		eventID: {
			type: String,
			required: true,
			immutable: true,
			unique: true
		},
		creatorID: { type: String, required: true },
		guildID: {
			type: String,
			required: true,
			immutable: true
		},
		textID: { type: String, required: false },
		vcID: { type: String, required: false },
		name: { type: String, required: true },
		description: { type: String, required: false },
		status: {
			type: Number,
			required: true,
			min: 1,
			max: 4,
			default: 1
		},
		participants: [{ type: String, required: true }]
	},
	{
		timestamps: true,
		statics: {
			async recover(scheduledEvents: GuildScheduledEventManager) {
				await scheduledEvents.fetch();

				let DBEvents = await this.find();

				for (const [eventID, event] of scheduledEvents.cache.entries()) {
					const foundEvent = DBEvents.find((e) => e.eventID === eventID);

					if (foundEvent) {
						foundEvent.name = event.name;
						foundEvent.description = event.description;
						foundEvent.status = event.status;
						foundEvent.vcID = event.channelId;
						if (event.status === GuildScheduledEventStatus.Active && !event.channel) {
							for (const [memberID] of event.channel.members) {
								if (!foundEvent.participants.includes(memberID)) {
									foundEvent.participants.push(memberID);
								}
							}
						}

						await foundEvent.save();
						DBEvents = DBEvents.filter((e) => e.eventID !== eventID);
					}
					else {
						Logger.debug('Event added to DB on Recovery');
						await this.create({
							eventID,
							guildID: event.guildId,
							creatorID: event.creatorId,
							vcID: event.channelId,
							name: event.name,
							description: event.description,
							participants: []
						});
					}
				}
				if (DBEvents.length > 0) {
					for (const e of DBEvents) {
						Logger.debug('Event Removed from DB');
						await e.deleteOne();
					}
				}
			}
		}
	}
);
// type eventDoc = Document<unknown, object, IEvent> & IEvent & { _id: Types.ObjectId };
interface eventFunctions extends Model<IEvent> {
	recover(scheduledEvents: GuildScheduledEventManager): Promise<void>;
}

export const EventsDB = model('events', eventSchema) as eventFunctions;
