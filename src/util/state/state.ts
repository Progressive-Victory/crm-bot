import { Client } from '@Client';
import { StateAbbreviation } from '@util/state/state-abbreviation';
import { Mutable } from '@util/types';
import {
	ChannelType, Guild, GuildMember, GuildMemberResolvable, Message, Role, RoleResolvable, Snowflake, TextChannel, ThreadMember, User 
} from 'discord.js';
import { client } from 'src/index';
import stateDb from '../Database/Schema/state';

interface StateOptions {
	roleID: Snowflake;
	guildID: Snowflake;
	channelID: Snowflake;
	stateLeadUserID?: Snowflake;
	name: string;
	abbreviation: StateAbbreviation;
}

export class State {
	readonly abbreviation: StateAbbreviation;

	readonly name: string;

	readonly role?: Role;

	readonly channel?: TextChannel;

	readonly lead?: GuildMember;

	readonly client: Client;

	readonly guild: Guild;

	constructor(options: StateOptions) {
		this.name = options.name;
		this.abbreviation = options.abbreviation;
		this.client = client;
		this.guild = client.guilds.cache.get(options.guildID);
		this.role = this.guild.roles.cache.get(options.roleID);
		this.channel = this.guild.channels.cache.get(options.channelID) as TextChannel;
	}

	/**
	 * setRole
	 * @param role role or role id
	 * @returns
	 */
	public async setRole(role: RoleResolvable) {
		const roleObject = role instanceof Role ? role : this.guild.roles.cache.find((r, k) => k === role);

		await stateDb.findOneAndUpdate({ abbreviation: this.abbreviation }, { roleId: roleObject.id });

		(this as Mutable<State>).role = roleObject;

		return this;
	}

	/**
	 *
	 * @param channel
	 * @returns
	 */
	public async setChannel(channel: Snowflake | TextChannel) {
		let textChannel: TextChannel;
		if (channel instanceof TextChannel) textChannel = channel;
		else {
			const channelObject = this.guild.channels.cache.find((r, k) => k === channel && r.type === ChannelType.GuildText);
			if (!(channelObject instanceof TextChannel)) throw Error('Snowflake is not text channel');
			textChannel = channelObject;
		}

		await stateDb.findOneAndUpdate({ abbreviation: this.abbreviation }, { channelID: textChannel.id });

		(this as Mutable<State>).channel = textChannel;

		return this;
	}

	/**
	 * setLead
	 */
	public async setLead(member: GuildMemberResolvable) {
		let memberObject: GuildMember;
		// If member is a GuildMember Object
		if (member instanceof GuildMember) memberObject = member;
		// If member is a User Object
		else if (member instanceof User) memberObject = this.guild.members.cache.get(member.id);
		// If member is a ThreadMember Object
		else if (member instanceof ThreadMember) memberObject = member.guildMember;
		// If member is a Message Object
		else if (member instanceof Message) member = member.member;
		// Then member is a string
		else memberObject = this.guild.members.cache.get(member);

		// Error if a GuildMember is not resolved
		if (!memberObject) throw Error('GuildMember not resolved');

		await stateDb.findOneAndUpdate({ abbreviation: this.abbreviation }, { leadID: memberObject.id });

		(this as Mutable<State>).lead = memberObject;

		return this;
	}
}
