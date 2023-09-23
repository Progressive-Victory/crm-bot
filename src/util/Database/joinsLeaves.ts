import {
	Guild, GuildMember, User, VoiceBasedChannel 
} from 'discord.js';
import { FilterQuery } from 'mongoose';
import {
	IVc, joins, leaves, vcJoins, vcLeaves 
} from './Schema';

export const server = {
	join(member: GuildMember) {
		return joins.create({
			userID: member.user.id,
			guildID: member.guild.id
		});
	},

	leave(member: GuildMember) {
		return leaves.create({
			userID: member.user.id,
			guildID: member.guild.id
		});
	},
	getMetric(guild: Guild, user?: User) {
		const query: FilterQuery<IVc> = { guildID: guild.id };
		if (user) query.userID = user.id;

		return Promise.all([vcJoins.find(query), vcLeaves.find(query)]);
	}
};

export const vc = {
	join(member: GuildMember, channel: VoiceBasedChannel) {
		return vcJoins.create({
			userID: member.user.id,
			guildID: member.guild.id,
			channelID: channel.id
		});
	},
	leave(member: GuildMember, channel: VoiceBasedChannel) {
		return vcLeaves.create({
			userID: member.user.id,
			guildID: member.guild.id,
			channelID: channel.id
		});
	},
	getMetric(guild: Guild, user?: User) {
		const query: FilterQuery<IVc> = { guildID: guild.id };
		if (user) query.userID = user.id;

		return Promise.all([vcJoins.find(query), vcLeaves.find(query)]);
	}
};
