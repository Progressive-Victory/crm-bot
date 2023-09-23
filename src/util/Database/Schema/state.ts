import { StateAbbreviation } from '@util/state/state-abbreviation';
import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface IState {
	guildId: Snowflake;
	roleId: Snowflake;
	channelId: Snowflake;
	stateLeadUserId?: Snowflake;
	name: string;
	abbreviation: StateAbbreviation;
}

const stateSchema = new Schema<IState>(
	{
		guildId: { type: String, required: true },
		roleId: String,
		channelId: String,
		stateLeadUserId: String,
		name: { type: String, required: true },
		abbreviation: { type: String, required: true }
	},
	{ timestamps: true }
);

export default model('state', stateSchema);
