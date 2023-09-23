import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface ISentMessages {
	userID: Snowflake;
	guildID: Snowflake;
	channelID: Snowflake;
	count: number;
}

const sentMessagesSchema = new Schema<ISentMessages>(
	{
		userID: { type: String, required: true },
		guildID: { type: String, required: true },
		channelID: { type: String, required: true },
		count: {
			type: Number,
			default: 0,
			required: true
		}
	},
	{ timestamps: true }
);

export default model('messages', sentMessagesSchema);
