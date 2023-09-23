import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

export interface ISentMessages {
	userID: Snowflake;
	guildID: Snowflake;
	channelID: Snowflake;
	count: number;
}

const sentMessagesSchema = new Schema<ISentMessages>(
	{
		userID: {
			type: String,
			required: true,
			immutable: true
		},
		guildID: {
			type: String,
			required: true,
			immutable: true
		},
		channelID: {
			type: String,
			required: true,
			immutable: true
		},
		count: {
			type: Number,
			default: 0,
			required: true
		}
	},
	{ timestamps: true }
);

export const sentMessages = model('messages', sentMessagesSchema);
