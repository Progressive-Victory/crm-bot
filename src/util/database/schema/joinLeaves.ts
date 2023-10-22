import {
	Guild, GuildMember, Snowflake, User 
} from 'discord.js';
import {
	Document, FilterQuery, Model, Query, Schema, Types, model 
} from 'mongoose';

export interface IJoinLeave {
	userID: Snowflake;
	guildID: Snowflake;
}

const joinSchema = new Schema<IJoinLeave>(
	{
		userID: { type: String, required: true },
		guildID: { type: String, required: true }
	},
	{
		timestamps: true,
		statics: {
			createFromMember(member: GuildMember) {
				return this.create({
					userID: member.user.id,
					guildID: member.guild.id
				});
			},
			getCount(guild: Guild, user?: User) {
				const query: FilterQuery<IJoinLeave> = { guildID: guild.id };
				if (user) query.userID = user.id;
				return this.find(query);
			}
		}
	}
);
// eslint-disable-next-line @typescript-eslint/ban-types
type joinLeaveDoc = Document<unknown, {}, IJoinLeave> & IJoinLeave & { _id: Types.ObjectId };

interface serverModel extends Model<IJoinLeave> {
	createFromMember(member: GuildMember): Promise<joinLeaveDoc>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	getCount(guild: Guild, user?: User): Query<number, joinLeaveDoc, {}, IJoinLeave, 'count'>;
}

export const serverJoins = model('joins', joinSchema) as serverModel;

export const serverLeaves = model('leaves', joinSchema) as serverModel;
