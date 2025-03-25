import { Snowflake } from "discord.js";

interface ISettings {
	guildId: Snowflake
	guildName: string,
	moderatorRoles: Snowflake[],
	warnLogChannelId: Snowflake,
	logChannelId: Snowflake,
}
