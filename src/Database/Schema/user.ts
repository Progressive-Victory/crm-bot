import { Schema, model } from 'mongoose';

const userSchema = new Schema(
	{
		id: String,
		guildId: String,
		name: String,
		isStaff: { type: Boolean, default: false },
		isStateLead: { type: Boolean, default: false },
		smeLeadId: String
	},
	{ timestamps: true }
);

export default model('user', userSchema);
