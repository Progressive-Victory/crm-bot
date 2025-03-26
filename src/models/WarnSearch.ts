import { Snowflake } from "discord.js";
import { model, Schema } from "mongoose";
import { IUser, user } from "./index.js";

export interface IWarnSearch {
	guildId: Snowflake
	targetDiscordId?: Snowflake,
	moderatorDiscordId?: Snowflake,
	expireAfter: Date
	searcher: IUser
	pageStart: number
	createdAt: Date

}

const search = new Schema<IWarnSearch>({
	guildId: {
		type: String,
		required:true,
		immutable: true
	},
	targetDiscordId: String,
	moderatorDiscordId: String,
	expireAfter: {
		type: Date,
		required: false,
	},
	searcher: user(true,true),
	pageStart: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		expires: 86400
	}
},{
	timestamps: true
});

export const WarningSearch = model<IWarnSearch>('Search', search, 'warningSearch');
