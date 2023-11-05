import { Client } from '@progressive-victory/client';
import { StateDoc } from '@util/database/index';
import { StateAbbreviation } from '@util/state/state-abbreviation';
import { Mutable } from '@util/types';
import {
	ChannelType, Guild, GuildMember, GuildMemberResolvable, Message, Role, RoleResolvable, Snowflake, TextChannel, ThreadMember, User 
} from 'discord.js';
import { client } from 'src/index';

const { STATE_LEAD_ROLE_ID } = process.env;

export interface StateOptions {
	abbreviation: StateAbbreviation;
}

export class State {
	/**
	 * DB record
	 */
	private DBAnchor: StateDoc;

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
	 * State leads assosiated with the state
	 */
	readonly leads?: GuildMember[];

	/**
	 * Region leads assosiated with the state
	 */
	readonly regionLeads?: GuildMember[];

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
	constructor(state: StateDoc) {
		this.DBAnchor = state;
		this.name = state.name;
		this.abbreviation = state.abbreviation;
		this.client = client;
		this.guild = client.guilds.cache.get(state.guildId);

		if (state.roleId) this.role = this.guild.roles.cache.get(state.roleId);
		if (state.channelId) this.channel = this.guild.channels.cache.get(state.channelId) as TextChannel;
		if (state.stateLeads.length > 0) this.leads = state.stateLeads.map((id) => this.guild.members.cache.get(id));
		else this.leads = [];
		if (state.regionLeads.length > 0) this.regionLeads = state.regionLeads.map((id) => this.guild.members.cache.get(id));
		else this.regionLeads = [];
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

		this.DBAnchor.roleId = roleObject.id;

		(this as Mutable<State>).role = roleObject;

		await this.DBAnchor.save();
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

		this.DBAnchor.channelId = textChannel.id;

		(this as Mutable<State>).channel = textChannel;

		await this.DBAnchor.save();
		return this;
	}

	/**
	 *
	 * @param member
	 * @returns
	 */
	public async addLead(member: GuildMemberResolvable) {
		const memberObject = this.resolveMember(member);

		this.DBAnchor.stateLeads.push(memberObject.id);

		(this as Mutable<State>).leads.push(memberObject);

		await Promise.all([memberObject.roles.add(STATE_LEAD_ROLE_ID), this.DBAnchor.save()]);

		return this;
	}

	/**
	 *
	 * @param member
	 * @returns
	 */
	public async removeLead(member: GuildMemberResolvable) {
		const memberObject = this.resolveMember(member);

		this.DBAnchor.stateLeads = this.DBAnchor.stateLeads.filter((id) => id !== memberObject.id);
		(this as Mutable<State>).leads = this.leads.filter((id) => id !== memberObject);

		await Promise.all([memberObject.roles.remove(STATE_LEAD_ROLE_ID), this.DBAnchor.save()]);
		return this;
	}

	/**
	 *
	 * @param member
	 * @returns
	 */
	public isStateLead(member: GuildMember) {
		for (const lead of this.leads) {
			if (lead === member) return true;
		}
		return false;
	}

	private resolveMember(member: GuildMemberResolvable) {
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
		return memberObject;
	}
}
