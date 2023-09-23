import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface IUser {
	id: Snowflake;
	guildId: Snowflake;
	name: string;
	isStaff: boolean;
	isStateLead: boolean;
	smeLeadId?: Snowflake;
}

const userSchema = new Schema<IUser>(
	{
		id: { type: String, required: true },
		guildId: { type: String, required: true },
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
		smeLeadId: String
	},
	{ timestamps: true }
);

export default model('user', userSchema);
