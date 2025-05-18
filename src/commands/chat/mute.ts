import { ChatInputCommandInteraction, 
	EmbedBuilder, 
	InteractionContextType, 
	PermissionFlagsBits, 
	SlashCommandBuilder, 
	User} from "discord.js";
import { ChatInputCommand } from "../../Classes/index.js";
import { GuildSetting } from "../../models/Setting.js";
import { getGuildChannel } from "../../util/index.js";


const MUTE_COLOR = 0x7c018c

export const mute = new ChatInputCommand({
	builder: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Commands for muting users')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setContexts(InteractionContextType.Guild)
		.addUserOption(option=>option
			.setName("user")
			.setDescription("Which user would you like to mute?")
			.setRequired(true)
		)
		.addIntegerOption(option=>option
			.setName('duration')
			.setDescription('How long should this user be muted?')
			.setRequired(true)
			.addChoices(
				{name:'3 min', value:3},
				{name:'10 min', value:10},
				{name:'30 min', value:30},
				{name:'1 hr', value:60},
				{name:'6 hr', value:60*6},
				{name:'1 day', value:60*24}
		))
		.addStringOption(option=>option
			.setName('reason')
			.setDescription('Why are you muting this user for this long?')
			.setMinLength(1)
			.setMaxLength(300)
			.setRequired(true)
		),
	execute: async(interaction)=>{
		
		muteUserForTime(interaction)
		logAction(interaction)
		dmNotification(interaction)
		// if user is still in vc
		vcNotification(interaction)
	}
})


/**
 * mute the user for the specified time
 * @param interaction command interaction from user
 */
function muteUserForTime(interaction:ChatInputCommandInteraction){
	//who are we muting
	const member = interaction.guild?.members.cache.get(
		interaction.options.getUser('user')?.id??""
	)
	// and for how long
	const durationMinutes = interaction.options.getInteger('duration') ?? 0
	const reason = interaction.options.getString('reason') ?? "Because an admin said so."
	
	// set mute to true
	member?.voice.setMute(true,reason)
	
	// set timeout to revert mute
	setTimeout(()=>{
		member?.voice.setMute(false,"Mute Time Elapsed")
	},durationMinutes*60000)
}


/**
 * log the mute in specified logging server
 * @param interaction command interaction from user
 */
async function logAction(interaction:ChatInputCommandInteraction){
	const {
		options,guild,user:muter
	} = interaction
	const settings = await GuildSetting.findOne({guildId:guild?.id})
	if (!settings?.logging.timeoutChannelId||!guild) return
	
	const mutedUser = options.getUser('user');
	const durationMinutes = options.getInteger('duration')
	const reason = options.getString('reason')
	if(mutedUser===null || durationMinutes===null || reason === null) return

	const timeoutChannel = await getGuildChannel(guild, settings.logging.timeoutChannelId)
	if(!timeoutChannel?.isSendable()) return

	timeoutChannel.send({embeds:[getMuteLogEmbed(muter,mutedUser,durationMinutes,reason)]})
}

/**
 * send a dm to the user informing them of why they were muted
 * @param interaction command interaction from user
 */
function dmNotification(interaction:ChatInputCommandInteraction){
	const mutedUser = interaction.options.getUser('user')
	const botIcon = interaction.client.user.displayAvatarURL({forceStatic:true})
	let durationMinutes = interaction.options.getInteger('duration')
	let durationHours = 0
	let durationDays = 0
	if (mutedUser===null || durationMinutes===null) return
	while (durationMinutes>=60){
		durationMinutes-=60
		durationHours+=1
	}
	while (durationHours>=24){
		durationHours-=24
		durationDays+=1
	}
	mutedUser.send({embeds:[getMuteNotificationEmbed(botIcon,`You were muted`,durationMinutes,durationHours,durationDays)]})
}

/**
 * send a notification to the voice chat for the current voice server
 * @param interaction command interaction from user
 */
function vcNotification(interaction:ChatInputCommandInteraction){
	const mutedUser = interaction.options.getUser('user')
	const botIcon = interaction.client.user.displayAvatarURL({forceStatic:true})

	if (mutedUser===null) return

	const mutedMember = interaction.guild?.members.cache.get(
		mutedUser.id
	)
	const adminMember = interaction.guild?.members.cache.get(
		interaction.user.id
	)
	const mutedVC = mutedMember?.voice.channel??null
	const adminVC = adminMember?.voice.channel
	
	if (mutedVC!==adminVC||mutedVC===null) return

	let durationMinutes = interaction.options.getInteger('duration')
	let durationHours = 0
	let durationDays = 0
	if (durationMinutes===null) return
	while (durationMinutes>=60){
		durationMinutes-=60
		durationHours+=1
	}
	while (durationHours>=24){
		durationHours-=24
		durationDays+=1
	}
	mutedVC.send({embeds:[getMuteNotificationEmbed(botIcon,`${mutedUser} was muted`,durationMinutes,durationHours,durationDays)]})
}

/**
 * construct the embed for a mute log
 * @param muter admin who is muting
 * @param user who is muted
 * @param durationMinutes how long are they muted for?
 * @param reason why were they muted?
 */
function getMuteLogEmbed(muter:User,user:User,durationMinutes:number,reason:string){
	const title = "User Muted"
	const description = `${user} was muted by ${muter} for ${durationMinutes} minutes because ${reason}`
	const icon = user.displayAvatarURL({forceStatic:true})
	return new EmbedBuilder()
		.setAuthor({iconURL:icon, name:title})
		.setDescription(description)
		.setTimestamp()
		.setFooter({text:`User ID: ${user.id}`})
		.setColor(MUTE_COLOR)
}

/**
 * construct the embed for a mute notification
 * @param iconURL url for icon of notification
 * @param address Short message to address message to whomever is going to see it
 * @param durationMinutes how long was the mute
 */
function getMuteNotificationEmbed(iconURL:string,address:string,durationMinutes:number,durationHours:number=0,durationDays:number=0){
	const title = "User Muted"
	const days = durationDays>0?`${durationDays} days `:""
	const hours = durationHours>0||durationDays>0?`${durationHours} hours and `:""
	const minutes = `${durationMinutes} minutes`
	const description = `${address} for ${days}${hours}${minutes}`
	return new EmbedBuilder()
		.setAuthor({iconURL:iconURL,name:title})
		.setDescription(description)
		.setTimestamp()
		.setColor(MUTE_COLOR)
}

