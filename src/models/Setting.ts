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
	},
	welcome: {
		channelId?: Snowflake,
		roleId?: Snowflake
	},
	logging: {
		timeoutChannelId?: Snowflake,
		leaveChannelId?: Snowflake
		channelUpdatesChannelId?: Snowflake
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
		logChannelId: {
			type: String
		},
	},
	welcome: {
		channelId: String,
		roleId: String
	},
	logging: {
		timeoutChannelId: {
			type:String
		},
		leaveChannelId: {
			type:String
		},
		channelUpdatesChannelId: {
			type:String
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
