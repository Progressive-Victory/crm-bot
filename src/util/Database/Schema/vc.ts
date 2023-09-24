import {
	Guild, GuildMember, Snowflake, User, VoiceBasedChannel 
} from 'discord.js';
import {
	Document, FilterQuery, Model, Query, Schema, Types, model 
} from 'mongoose';

export interface IVc {
	userID: Snowflake;
	guildID: Snowflake;
	channelID: Snowflake;
}

const vcSchema = new Schema<IVc>(
	{
		userID: { type: String, required: true },
		guildID: { type: String, required: true },
		channelID: { type: String, required: true }
	},
	{
		timestamps: true,
		statics: {
			newFromMember(member: GuildMember, channel: VoiceBasedChannel) {
				return this.create({
					userID: member.user.id,
					guildID: member.guild.id,
					channelID: channel.id
				});
			},
			getCount(guild: Guild, user?: User) {
				const query: FilterQuery<IVc> = { guildID: guild.id };
				if (user) query.userID = user.id;
				return this.count(query);
			}
		}
	}
);

// eslint-disable-next-line @typescript-eslint/ban-types
type vcDoc = Document<unknown, {}, IVc> & IVc & { _id: Types.ObjectId };

interface VCModel extends Model<IVc> {
	newFromMember(member: GuildMember, channel: VoiceBasedChannel): Promise<vcDoc>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	getCount(guild: Guild, user?: User): Query<number, vcDoc, {}, IVc, 'count'>;
}

export const vcJoins = model('vcjoins', vcSchema) as VCModel;

export const vcLeaves = model('vcleaves', vcSchema) as VCModel;
