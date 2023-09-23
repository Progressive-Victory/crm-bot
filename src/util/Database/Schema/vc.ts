import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

export interface IVc {
	userID: Snowflake;
	guildID: Snowflake;
	channelID: Snowflake;
}

const vcSchema = new Schema<IVc>(
	{
		userID: { type: String, required: true },
		guildID: { type: String, required: true },
		channelID: { type: String, required: true }
	},
	{ timestamps: true }
);

export const vcJoins = model('vcjoins', vcSchema);

export const vcLeaves = model('vcleaves', vcSchema);
