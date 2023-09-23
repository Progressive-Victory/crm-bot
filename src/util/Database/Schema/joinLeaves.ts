import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

export interface IJoinLeave {
	userID: Snowflake;
	guildID: Snowflake;
}

const joinSchema = new Schema<IJoinLeave>(
	{
		userID: { type: String, required: true },
		guildID: { type: String, required: true }
	},
	{ timestamps: true }
);

export const joins = model('joins', joinSchema);

export const leaves = model('leaves', joinSchema);
