import { logger } from '@progressive-victory/client';
import { State, StateAbbreviation } from '@util/state';
import {
	Guild, GuildMember, Snowflake, TextChannel 
} from 'discord.js';
import {
	Document, Model, Schema, Types, model 
} from 'mongoose';

interface IState {
	name: string;
	abbreviation: StateAbbreviation;
	stateLeads: Snowflake[];
	regionLeads: Snowflake[];
	channelId: Snowflake;
	roleId: Snowflake;
	guildId: Snowflake;
}

const stateSchema = new Schema<IState>(
	{
		name: { type: String, required: true },
		abbreviation: { type: String, required: true },
		stateLeads: [
			{
				type: String,
				required: false
			}
		],
		regionLeads: [
			{
				type: String,
				required: false
			}
		],
		channelId: { type: String, required: false },
		roleId: { type: String, required: false },
		guildId: {
			type: String,
			required: false,
			immutable: true
		}
	},
	{
		timestamps: true,
		statics: {
			async getStateFromChannel(channel: TextChannel) {
				const doc = await this.findOne({ channelId: channel.id });
				if (!doc) {
					logger.error('State not found');
					return null;
				}
				return new State(doc);
			},
			async getStateFromAbbreviation(state: StateAbbreviation, guild: Guild) {
				const doc = await this.findOne({ abbreviation: state.toLocaleLowerCase(), guildId: guild.id });
				if (!doc) {
					logger.error('State not found');
					return null;
				}
				return new State(doc);
			},
			async getStateFromMember(member: GuildMember) {
				for (const doc of await this.find()) {
					if (member.roles.cache.has(doc.roleId)) {
						return new State(doc);
					}
				}
				return null;
			}
		}
	}
);

export type StateDoc = Document<unknown, object, IState> & IState & { _id: Types.ObjectId };

interface StateModal extends Model<IState> {
	getStateFromChannel(channel: TextChannel): Promise<State | null>;
	getStateFromAbbreviation(state: StateAbbreviation, guild: Guild): Promise<State | null>;
	getStateFromMember(member: GuildMember): Promise<State | null>;
}

export const stateDb = model('states', stateSchema) as StateModal;
