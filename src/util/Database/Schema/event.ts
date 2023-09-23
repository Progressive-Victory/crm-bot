import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface IEvent {
	id: Snowflake;
	guildID: Snowflake;
	textID?: Snowflake;
	vcID?: Snowflake;
	participants: number;
}

const eventSchema = new Schema<IEvent>(
	{
		id: { type: String, required: true },
		guildID: { type: String, required: true },
		textID: String,
		vcID: String,
		participants: {
			type: Number,
			required: true,
			default: 0
		}
	},
	{ timestamps: true }
);

export default model('event', eventSchema);
