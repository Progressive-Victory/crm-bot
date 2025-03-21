import { Snowflake } from "discord.js";
import { model, Schema } from "mongoose";

export interface IWarnSearch {
	targetDiscordId?: Snowflake,
	moderatorDiscordId?: Snowflake,
	expireAfter: Date
	searcherDiscordId?: Snowflake
	searcherUsername?: string
	pageStart: number
	createdAt: Date

}

const search = new Schema<IWarnSearch>({
	targetDiscordId: String,
	moderatorDiscordId: String,
	expireAfter: {
		type: Date,
		required: true,
		default: Date.now()
	},
	searcherDiscordId: {
		type: String,
		required: true
	},
	searcherUsername: String,
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
