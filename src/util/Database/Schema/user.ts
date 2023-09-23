import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface IUser {
	id: Snowflake;
	guildID: Snowflake;
	name: string;
	isStaff: boolean;
	isStateLead: boolean;
	smeLeadID?: Snowflake;
}

const userSchema = new Schema<IUser>(
	{
		id: { type: String, required: true },
		guildID: { type: String, required: true },
		name: String,
		isStaff: {
			type: Boolean,
			default: false,
			required: true
		},
		isStateLead: {
			type: Boolean,
			default: false,
			required: true
		},
		smeLeadID: String
	},
	{ timestamps: true }
);

export default model('user', userSchema);
