import { StateAbbreviation } from '@util/state/state-abbreviation';
import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface IState {
	guildID: Snowflake;
	roleID: Snowflake;
	channelID: Snowflake;
	stateLeadUserID?: Snowflake;
	name: string;
	abbreviation: StateAbbreviation;
}

const stateSchema = new Schema<IState>(
	{
		guildID: { type: String, required: true },
		roleID: String,
		channelID: String,
		stateLeadUserID: String,
		name: { type: String, required: true },
		abbreviation: { type: String, required: true }
	},
	{ timestamps: true }
);

export default model('state', stateSchema);
