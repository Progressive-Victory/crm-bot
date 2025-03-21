import { Snowflake } from "discord.js";
import { model, Schema } from "mongoose";

export interface IWarnSearch {
	targetDiscordId?: Snowflake,
	moderatorDiscordId?: Snowflake,
	expireAfter?: Date
	searcherDiscordId?: Snowflake
	searcherUsername?: string
	pageStart: number

}

const search = new Schema<IWarnSearch>({
	targetDiscordId: String,
	moderatorDiscordId: String,
	expireAfter: Date,
	searcherDiscordId: {
		type: String,
		required: true
	},
	searcherUsername: String,
	pageStart: {
		type: Number,
		default: 0
	},
},{
	timestamps: true
});

export const WarningSearch = model<IWarnSearch>('Search', search, 'warningSearch');
