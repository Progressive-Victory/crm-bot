import { GuildMember, MessageFlags, SendableChannels } from "discord.js"
import { baseWelcomeContainer } from "./component.js"

/**
 *
 * @param member
 * @param channel
 */
export function joinLog(member:GuildMember, channel:SendableChannels) {

	const container = baseWelcomeContainer(member)

	channel.send({
		flags: MessageFlags.IsComponentsV2,
		components: [container]
	})
}
