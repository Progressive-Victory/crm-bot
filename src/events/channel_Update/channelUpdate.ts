import { Events, MessageCreateOptions, Role, EmbedBuilder } from "discord.js"; //look at discord.js for info
import Event from "../../Classes/Event.js"; //read Event.ts
import { GuildSetting } from "../../models/Setting.js";

export const channelUpdate = new Event({
	name: Events.ChannelUpdate,
	execute: async (oldChannel, newChannel) => {
		if(oldChannel.isDMBased() || newChannel.isDMBased()) return; //exclude DM channels
		
		const guild = newChannel.guild;
		const settings = await GuildSetting.findOne({guildId: guild.id});
		const logChannelId = settings?.logging.channelUpdatesChannelId;
		
		console.log(logChannelId);
		if(!logChannelId) return;
		const logChannel = guild.channels.cache.get(logChannelId) ?? await guild.channels.fetch(logChannelId) ?? undefined;
		
		console.log(logChannel);
		if(!logChannel?.isSendable()) return;
		const [channel1Diff, channel2Diff] = getJSONDiff(oldChannel.toJSON(), newChannel.toJSON());
		
		//console.log("channel 1 diff: ", channel1Diff, "\nchannel 2 diff: ", channel2Diff);

		const auditLog = guild.fetchAuditLogs
		
		let embed = 
				new EmbedBuilder()
					.setTitle('A channel has benn Updated')
		
		for(const key in channel1Diff){
			embed.addFields({ name: key + ' has been changed from', value: channel1Diff[key], inline: false },
							{ name: 'to', value: `${channel2Diff[key]}`, inline: false },
						);
		}
		
		embed.setDescription('description !!');
		logChannel.send({ embeds: [ embed ] } );
	}
});


//probably put this in another file and use it for other checking other log changes
function getJSONDiff(JSON1: Record<string, any>, JSON2: Record<string, any>){
	let JSON1Diff: Record<string, any> = {};
	let JSON2Diff: Record<string, any> = {};
	
	//IDK if this can happen:
	//keysOnlyIn1 = set(JSON1.keys()) - set(JSON2.keys());
	//keysOnlyIn2 = set(Json2.keys()) - set(JSON1.keys());
	
	for(const key in JSON1){
		let J1 = JSON1[key as keyof typeof JSON1];
		let J2 = JSON2[key as keyof typeof JSON2];
		if(Array.isArray(J1) && Array.isArray(J2)){
			if(!arrayEqual(J1, J2)){
				JSON1Diff[key] = JSON1[key];
				JSON2Diff[key] = JSON2[key];
			}
		} else if(J1 !== J2){
			JSON1Diff[key] = JSON1[key];
			JSON2Diff[key] = JSON2[key];	
		}
	}
	return [JSON1Diff, JSON2Diff];
}

function arrayEqual(arr1:any, arr2:any) {
	if (arr1.length !== arr2.length) {
		return false;
	}
	const sortedArr1 = [...arr1].sort();
	const sortedArr2 = [...arr2].sort();
	
	for (let i = 0; i < sortedArr1.length; i++) {
		if (sortedArr1[i] !== sortedArr2[i]) {
			return false;
		}
	}
	
	return true;
}
