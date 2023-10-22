import { StateAbbreviation } from '@util/state';
import { GuildMember, Snowflake } from 'discord.js';
import {
	Document, Model, Schema, Types, model 
} from 'mongoose';
import { StateDoc, states } from '.';

interface Iuser {
	userId: Snowflake;
	guildId: Snowflake;
	state?: Schema.Types.ObjectId;
	isStateLead: boolean;
	isStaff: boolean;
}

const userSchema = new Schema<Iuser>(
	{
		userId: {
			type: String,
			required: true,
			immutable: true
		},
		guildId: {
			type: String,
			required: true,
			immutable: true
		},
		state: {
			type: Schema.Types.ObjectId,
			ref: 'states',
			required: false
		},
		isStateLead: {
			type: Boolean,
			required: true,
			default: false
		},
		isStaff: {
			type: Boolean,
			required: true,
			default: false
		}
	},
	{
		timestamps: true,
		statics: {
			findMember(member: GuildMember) {
				return this.findOne({ userId: member.id, guildId: member.guild.id });
			},
			async getMembersState(member: GuildMember) {
				const user = await this.findOne({ userId: member.id, guildId: member.guild.id });
				return states.findById(user.state);
			},
			async setMemberState(member: GuildMember, state: StateAbbreviation) {
				const stateRecord = await states.findOne({ abbreviation: state });
				return this.findOneAndUpdate({ userId: member.id, guildId: member.guild.id }, { state: stateRecord._id });
			}
		}
	}
);

export type UserDoc = Document<unknown, object, Iuser> & Iuser & { _id: Types.ObjectId };

interface UserSchema extends Model<Iuser> {
	findMember(member: GuildMember): Promise<UserDoc>;
	getMembersState(member: GuildMember): Promise<StateDoc>;
	setMemberState(member: GuildMember, state: StateAbbreviation): Promise<UserDoc>;
}

export const users = model('users', userSchema) as UserSchema;
