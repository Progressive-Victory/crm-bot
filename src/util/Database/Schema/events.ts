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
			required: true
		}
		// creatorID: { type: String, required: true },
		// guildID: {
		// 	type: String,
		// 	required: true
		// },
		// textID: { type: String, required: false },
		// vcID: { type: String, required: false },
		// name: { type: String, required: true },
		// description: { type: String, required: false },
		// status: {
		// 	type: Number,
		// 	required: true,
		// 	min: 1,
		// 	max: 4,
		// 	default: 1
		// },
		// participants: [{ type: String, required: true }]
	},
	{
		timestamps: true,
		statics: {
			async recover(scheduledEvents: GuildScheduledEventManager) {
				await scheduledEvents.fetch();
			}
		}
	}
);
// type eventDoc = Document<unknown, object, IEvent> & IEvent & { _id: Types.ObjectId };
interface eventFunctions extends Model<IEvent> {
	recover(scheduledEvents: GuildScheduledEventManager): Promise<void>;
}

export const EventsDB = model('events', eventSchema) as eventFunctions;
