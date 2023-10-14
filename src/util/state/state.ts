import { Client } from '@Client';
import { StateAbbreviation } from '@util/state/state-abbreviation';
import { Mutable } from '@util/types';
import {
	ChannelType, Guild, GuildMember, GuildMemberResolvable, Message, Role, RoleResolvable, Snowflake, TextChannel, ThreadMember, User 
} from 'discord.js';
import { client } from 'src/index';
import stateDb from '../Database/Schema/state';

export interface StateOptions {
	role?: Role;
	guild: Guild;
	channel?: TextChannel;
	stateLead?: GuildMember;
	name: string;
	abbreviation: StateAbbreviation;
}

export class State {
	/**
	 * Lowercase abbreviation of the state
	 */
	readonly abbreviation: StateAbbreviation;

	/**
	 * Name of the state
	 */
	readonly name: string;

	/**
	 * Role assosiated with the state
	 */
	readonly role?: Role;

	/**
	 * Channel assosiated with the state
	 */
	readonly channel?: TextChannel;

	/**
	 * Member assosiated with the state
	 */
	readonly lead?: GuildMember;

	/**
	 * Discord bot Client
	 */
	readonly client: Client;

	/**
	 * Assosiated Discord Server
	 */
	readonly guild: Guild;

	/**
	 * Defualt constructor for statesw
	 * @param options
	 */
	constructor(options: StateOptions) {
		const {
			name, abbreviation, guild, role, channel, stateLead 
		} = options;

		this.name = name;
		this.abbreviation = abbreviation;
		this.client = client;
		this.guild = guild;

		if (role) this.role = role;
		if (channel) this.channel = channel;
		if (stateLead) this.lead = stateLead;
	}

	/**
	 * setRole
	 * @param role role or role id
	 * @returns
	 */
	public async setRole(role: RoleResolvable) {
		let roleObject: Role;
		if (role instanceof Role) roleObject = role;
		else roleObject = this.guild.roles.cache.find((r, k) => k === role);

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
	 *
	 * @param member
	 * @returns
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
