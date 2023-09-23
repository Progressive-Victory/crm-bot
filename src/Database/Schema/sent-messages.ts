import { Schema, model } from 'mongoose';

const sentMessagesSchema = new Schema(
	{
		userId: String,
		guildId: String,
		channelId: String,
		count: Number
	},
	{ timestamps: true }
);

export default model('messages', sentMessagesSchema);
