import { State } from '@util/state';
import { StateAbbreviation } from '@util/state/state-abbreviation';
import {
	Guild, Snowflake, TextChannel 
} from 'discord.js';
import {
	Model, Schema, model 
} from 'mongoose';

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
	{
		timestamps: true,
		statics: {
			// TODO: Fix so if not all data is present object is created
			async getState(abbreviation: StateAbbreviation, guild: Guild) {
				const state = await this.findOne({ abbreviation });
				return new State({
					abbreviation,
					name: state.name,
					guild,
					channel: guild.channels.cache.get(state.channelID) as TextChannel,
					role: guild.roles.cache.get(state.roleID),
					stateLead: guild.members.cache.get(state.stateLeadUserID)
				});
			}
		}
	}
);

interface stateModel extends Model<IState> {
	getState(abbreviation: StateAbbreviation, guild: Guild): Promise<State>;
}

export default model('state', stateSchema) as stateModel;
