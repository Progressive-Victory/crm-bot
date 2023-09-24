import {
	Guild, Message, Snowflake, TextBasedChannel, User 
} from 'discord.js';
import {
	Document, FilterQuery, Model, Query, Schema, Types, model 
} from 'mongoose';

export interface ISentMessages {
	userID: Snowflake;
	guildID: Snowflake;
	channelID: Snowflake;
	count: number;
}

const sentMessagesSchema = new Schema<ISentMessages>(
	{
		userID: {
			type: String,
			required: true,
			immutable: true
		},
		guildID: {
			type: String,
			required: true,
			immutable: true
		},
		channelID: {
			type: String,
			required: true,
			immutable: true
		},
		count: {
			type: Number,
			default: 0,
			required: true
		}
	},
	{
		timestamps: true,
		statics: {
			newFromMessage(message: Message<true>) {
				return this.findOneAndUpdate(
					{
						userID: message.author.id,
						guildID: message.guildId,
						channelID: message.channelId
					},
					{ $inc: { count: 1 } },
					{ upsert: true }
				);
			},
			getCount(guild: Guild, user?: User, channel?: TextBasedChannel) {
				const query: FilterQuery<ISentMessages> = { guildID: guild.id };
				if (user) query.userID = user.id;
				if (channel) query.channelID = channel.id;

				return this.count(query);
			}
		}
	}
);

// eslint-disable-next-line @typescript-eslint/ban-types
type sentMessagesDoc = Document<unknown, {}, ISentMessages> & ISentMessages & { _id: Types.ObjectId };

interface sentMessagesModel extends Model<ISentMessages> {
	// eslint-disable-next-line @typescript-eslint/ban-types
	newFromMessage(message: Message<true>): Query<sentMessagesDoc, sentMessagesDoc, {}, ISentMessages, 'findOneAndUpdate'>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	getCount(guild: Guild, user?: User, channel?: TextBasedChannel): Query<number, sentMessagesDoc, {}, ISentMessages, 'count'>;
}

export const sentMessages = model('messages', sentMessagesSchema) as sentMessagesModel;
