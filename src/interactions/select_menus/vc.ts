import { Interaction } from '@Client';
import { ns } from '@builders/lead';
import { t } from '@i18n';
import {
	ChannelType, GuildMember, MentionableSelectMenuInteraction, Role, TextChannel, VoiceChannel 
} from 'discord.js';

const parentId = process.env.EVENT_CATEGORY_ID;

async function execute(interaction: MentionableSelectMenuInteraction) {
	const {
		roles, members, guild, locale 
	} = interaction;
	const event = guild.scheduledEvents.cache.find((_c, k) => k === interaction.customId.split(interaction.client.splitCustomIDOn)[1]);
	if (!event) {
		await interaction.update({ content: 'Event was Deleted', components: [] });
	}
	const textChannel = guild.channels.cache.find(
		(c) => c.parentId === parentId && c.type === ChannelType.GuildText && (c as TextChannel).topic.split(':')[1] === event.id
	) as TextChannel;
	const voiceChannel = event.channel as VoiceChannel;

	await Promise.all([textChannel.lockPermissions(), voiceChannel.lockPermissions()]);

	await Promise.all([
		async () => {
			for (const [, member] of members) {
				await textChannel.permissionOverwrites.edit(member as GuildMember, { ViewChannel: true });
				await voiceChannel.permissionOverwrites.edit(member as GuildMember, { ViewChannel: true });
			}
		},
		async () => {
			for (const [, role] of roles) {
				await textChannel.permissionOverwrites.edit(role as Role, { ViewChannel: true });
				await voiceChannel.permissionOverwrites.edit(role as Role, { ViewChannel: true });
			}
		},
		interaction.reply({
			content: t({
				key: 'event-select-reply',
				ns,
				locale
			}),
			ephemeral: true
		})
	]);
}

export default new Interaction<MentionableSelectMenuInteraction>().setName('vc').setExecute(execute);
