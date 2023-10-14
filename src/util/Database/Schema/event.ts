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
			immutabl: true,
			unique: true
		},
		creatorID: { type: String, required: true },
		guildID: {
			type: String,
			required: true,
			immutabl: true
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
			}
		}
	}
);
interface eventFunctions extends Model<IEvent> {
	recover(scheduledEvents: GuildScheduledEventManager): Promise<void>;
}

export const Events = model('event', eventSchema) as eventFunctions;
