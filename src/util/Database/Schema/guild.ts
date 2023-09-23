import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

interface IGuild {
	id: Snowflake;
	name: string;
	event: {
		logChannelId: Snowflake;
		eventCategoryId: Snowflake;
	};
	leadRenameableChannels: [{ id: Snowflake }];
	smeRoles: [{ id: Snowflake }];
}

const guidSchema = new Schema<IGuild>(
	{
		id: { type: String, required: true },
		name: { type: String, required: true },
		event: {
			logChannelId: String,
			eventCategoryId: String
		},
		leadRenameableChannels: [{ id: String }],
		smeRoles: [{ id: String }]
	},
	{ timestamps: true }
);

export default model('guild', guidSchema);
