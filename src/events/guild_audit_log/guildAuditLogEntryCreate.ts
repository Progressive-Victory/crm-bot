import { APIRole, AuditLogEvent, Colors, EmbedBuilder, Events, Guild, GuildAuditLogsEntry, roleMention, User, userMention } from "discord.js";
import Event from "../../Classes/Event.js";
import { timeoutEmbed } from "../../features/timeout.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";

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
			const executorMember = guild.members.resolve(executorId)
			const targetMember = guild.members.resolve(target)
	
			if(executorMember?.user.bot || !(targetMember && executorMember)) return
			
			const timeoutChannel = await getGuildChannel(guild, settings.logging.timeoutChannelId)
			
			if(!timeoutChannel?.isSendable()) return
			
			const newDate = changes[0].new ? new Date((changes[0].new)) : undefined;
			const embed = timeoutEmbed(targetMember, executorMember, auditLogEntry.createdAt, newDate!, auditLogEntry.reason ?? undefined)
			
			timeoutChannel.send({embeds:[embed]})
		} else if (settings?.logging.memberRoleUpdatesChannelId
            && auditLogEntry.action === AuditLogEvent.MemberRoleUpdate
            && executorId
            && targetId
        ) {
            const logChannel = await getGuildChannel(guild, settings.logging.memberRoleUpdatesChannelId)
            if(!logChannel?.isSendable()) return

            const changes = auditLogEntry.changes[0]
            const key = changes.key
            const apiRole = (changes.new as Pick<APIRole, "name" | "id">[])[0]
            // const executorMember = guild.members.resolve(executorId)
            const targetMember = guild.members.resolve(targetId)


            logChannel.send({embeds:[new EmbedBuilder()
                .setAuthor({iconURL: targetMember!.displayAvatarURL({forceStatic:true}), name: key === '$add' ? 'Role Added' : 'Role Removed' })
                .setDescription(`${targetMember} had ${roleMention(apiRole.id)} ${key === '$add' ? 'added' : 'removed' } by ${userMention(executorId)}`)
                .setTimestamp()
                .setColor(Colors.Purple)
                .setFooter({text: `User ID: ${targetId}`})
            ]})
        }	
	}
})
