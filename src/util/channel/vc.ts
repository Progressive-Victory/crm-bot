import { t } from '@i18n';
import { logger } from '@progressive-victory/client';
import {
	Collection, Snowflake, VoiceBasedChannel 
} from 'discord.js';
import { config } from 'dotenv';

config();
const { STATE_LEAD_RENAMEABLE_CHANNELIDS } = process.env;

export const VCChannelIDs = STATE_LEAD_RENAMEABLE_CHANNELIDS.split(',').filter((e) => !!e);

export const VCChannelNames = new Collection<Snowflake, string>();

VCChannelIDs.forEach((id, index) => {
	VCChannelNames.set(id, `Organizing VC ${index + 1}`);
});

export async function renameOrganizing(channel: VoiceBasedChannel) {
	if (channel && !channel.guild.members.me.permissions.has('ManageChannels')) return;

	if (VCChannelNames.has(channel.id) && !channel.members.size && channel.name !== VCChannelNames.get(channel.id)) {
		logger.debug(`Renaming ${channel.name} (${channel.id}) to ${VCChannelNames.get(channel.id)}`);

		const auditReason = t({
			key: 'vc-rename-success',
			locale: channel.guild.preferredLocale,
			ns: 'lead',
			args: { channel: channel.name }
		});

		await channel
			.setName(VCChannelNames.get(channel.id), auditReason)
			.then(() => logger.debug(`Successfully renamed ${channel.name} (${channel.id})`))
			.catch((err) => logger.error(`Error renaming ${channel.name} (${channel.id})`, err));
	}
}
