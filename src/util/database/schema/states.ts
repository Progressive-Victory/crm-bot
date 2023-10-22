import { StateAbbreviation } from '@util/state';
import {
	GuildMember, Role, Snowflake, TextChannel 
} from 'discord.js';
import {
	Document, Model, Schema, Types, model 
} from 'mongoose';
import { users } from '.';

interface IState {
	name: string;
	abbreviation: StateAbbreviation;
	stateLeads: Schema.Types.ObjectId[];
	channelId: Snowflake;
	roleId: Snowflake;
}

const stateSchema = new Schema<IState>(
	{
		name: { type: String, required: true },
		abbreviation: { type: String, required: true },
		stateLeads: [
			{
				type: Schema.Types.ObjectId,
				ref: 'users',
				required: false
			}
		],
		channelId: { type: String, required: false },
		roleId: { type: String, required: false }
	},
	{
		timestamps: true,
		statics: {
			async setStateLead(member: GuildMember) {
				const user = await users.findMember(member);
				return this.findByIdAndUpdate(user.state, { $push: { stateLeads: user._id } });
			},
			async setChannel(channel: TextChannel, state: StateAbbreviation) {
				return this.findOne({ abbreviation: state }, { channelId: channel.id });
			},
			async setRole(role: Role, state: StateAbbreviation) {
				return this.findOne({ abbreviation: state }, { roleId: role.id });
			}
		}
	}
);

export type StateDoc = Document<unknown, object, IState> & IState & { _id: Types.ObjectId };

interface StateModal extends Model<IState> {
	setStateLead(member: GuildMember): Promise<StateDoc>;
	setChannel(channel: TextChannel, state: StateAbbreviation): Promise<StateDoc>;
	setRole(role: Role, state: StateAbbreviation): Promise<StateDoc>;
}

export const states = model('states', stateSchema) as StateModal;
