import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface ISentMessages {
	userId: Snowflake;
	guildId: Snowflake;
	channelId: Snowflake;
	count: number;
}

const sentMessagesSchema = new Schema<ISentMessages>(
	{
		userId: { type: String, required: true },
		guildId: { type: String, required: true },
		channelId: { type: String, required: true },
		count: {
			type: Number,
			default: 0,
			required: true
		}
	},
	{ timestamps: true }
);

export default model('messages', sentMessagesSchema);
