import {
	Collection, Guild, GuildMember, Role, Snowflake 
} from 'discord.js';
import {
	Model, Schema, model 
} from 'mongoose';

export interface ISme {
	roleId: Snowflake;
	guildId: Snowflake;
	leadId: Snowflake;
	name: string;
	description: string;
}

const smeSchema = new Schema<ISme>(
	{
		roleId: { type: String, required: true },
		guildId: { type: String, required: true },
		leadId: { type: String, required: false },
		name: { type: String, required: true },
		description: { type: String, required: false }
	},
	{
		timestamps: true,
		statics: {
			async hasSmeRole(member: GuildMember) {
				const roleRecords = await this.find({ guildId: member.guild.id, roleId: { $in: member.roles.cache.map((r, k) => k) } });
				if (roleRecords.length === 0) {
					return false;
				}
				return true;
			},
			async isSmeRole(role: Role) {
				const roleRecord = await this.findOne({ guildId: role.guild.id, roleId: role.id });
				if (!roleRecord) {
					return false;
				}
				return true;
			},
			async getSmeLead(role: Role) {
				const roleRecord = await this.findOne({ guildId: role.guild.id, roleId: role.id });
				if (!roleRecord) {
					return null;
				}
				return role.guild.members.cache.find((m, k) => k === roleRecord.leadId) || null;
			},
			async getSmeRoles(guild: Guild) {
				const roleRecords = await this.find({ guildId: guild.id });
				const roles = new Collection<Snowflake, Role>();
				for (const roleRecord of roleRecords) {
					roles.set(roleRecord.roleId, await guild.roles.fetch(roleRecord.roleId));
				}
				return roles;
			}
		}
	}
);

interface smeModel extends Model<ISme> {
	hasSmeRole(member: GuildMember): Promise<boolean>;
	isSmeRole(role: Role): Promise<boolean>;
	getSmeLead(role: Role): Promise<GuildMember | null>;
	getSmeRoles(guild: Guild): Promise<Collection<Snowflake, Role>>;
}

export const smeModal = model('sme', smeSchema) as smeModel;
