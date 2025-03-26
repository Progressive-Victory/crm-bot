import { Snowflake } from "discord.js";
import { HydratedDocument, model, Schema } from "mongoose";

export interface ISettings {
	guildId: Snowflake
	guildName: string,
	warn: {
		logChannelId?: Snowflake,
		appealChannelId?: Snowflake,
	},
	report: {
		logChannelId?: Snowflake,
	}
}

export type SettingRecord = HydratedDocument<ISettings>

const settings = new Schema<ISettings>({
	guildId: {
		type:String,
		required: true,
		immutable: true
	},
	guildName: {
		type:String,
		required: true,
		immutable: false
	},
	warn: {
		logChannelId: {
			type:String,
		},
		appealChannelId: {
			type:String,
		},
	},
	report: {
		reportLogChannelId: {
			type: String
		},
	}

},
{
	timestamps:{
		createdAt: true,
		updatedAt: true
	}
})

export const GuildSetting = model<ISettings>('setting', settings, 'Settings')
