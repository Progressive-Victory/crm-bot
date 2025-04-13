import { AuditLogEvent, Events, Guild, GuildAuditLogsEntry, User, EmbedBuilder, inlineCode, channelMention } from "discord.js";
import Event from "../../Classes/Event.js";
import { timeoutEmbed } from "../../features/timeout.js";
import { GuildSetting } from "../../models/Setting.js";
import { getAuthorOptions } from "../../features/moderation/embeds.js";


export const guildAuditLogEntryCreate = new Event({
	name: Events.GuildAuditLogEntryCreate,
	execute: async (auditLogEntry:GuildAuditLogsEntry, guild:Guild) => {
		const { executorId, target, changes, targetId } = auditLogEntry;
		const settings = await GuildSetting.findOne({guildId: guild.id})
		if (settings?.logging.timeoutChannelId
			&& auditLogEntry.action == AuditLogEvent.MemberUpdate
			&& changes[0].key == 'communication_disabled_until'
			&& (target instanceof User)
			&& executorId
		) { 
			const executorMember = guild.members.cache.get(executorId) ?? await guild.members.fetch(executorId)
			const targetMember = guild.members.resolve(target)
			
			if(executorMember?.user.bot || !(targetMember && executorMember)) return
			
			const timeoutChannel = guild.channels.cache.get(settings?.logging.timeoutChannelId) ?? await guild.channels.fetch(settings?.logging.timeoutChannelId) ?? undefined
			
			if(!timeoutChannel?.isSendable()) return
			
			const newDate = changes[0].new ? new Date((changes[0].new)) : undefined;
			const embed = timeoutEmbed(targetMember, executorMember, auditLogEntry.createdAt, newDate!, auditLogEntry.reason ?? undefined)
			
			timeoutChannel.send({embeds:[embed]})
		}else if(settings?.logging.channelUpdatesChannelId
				&& auditLogEntry.action === AuditLogEvent.ChannelUpdate
				&& targetId
				&& executorId
		){
			const logChannel = guild.channels.cache.get(settings?.logging.channelUpdatesChannelId) ?? await guild.channels.fetch(settings?.logging.channelUpdatesChannelId) ?? undefined;
			if(!logChannel?.isSendable()) return;
			
			const executorMember = guild.members.cache.get(executorId) ?? await guild.members.fetch(executorId)

			const embed = 
				new EmbedBuilder()
					.setTitle('A channel has benn Updated')
					.setDescription(channelMention(targetId))
					.setAuthor(getAuthorOptions(executorMember))
					.setTimestamp(auditLogEntry.createdAt)
			
			for (const change of auditLogEntry.changes){
				embed.addFields(
						{ name:change.key, value: `old: ${inlineCode(change.old?.toString() ?? 'undefined')}\nnew: ${inlineCode(change.new?.toString() ?? 'undefined')}`},
						);
			}
			logChannel.send({embeds: [ embed ]});
			console.log(auditLogEntry);
		}/*else if() for each of:
			AuditLogEvent.ChannelOverwriteCreate
		AuditLogEvent.ChannelOverwriteDelete
		AuditLogEvent.ChannelOverwriteUpdate
*/
		
		
	}
})
