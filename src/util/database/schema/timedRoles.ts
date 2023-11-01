import { logger } from '@progressive-victory/client';
import { Snowflake } from 'discord.js';
import {
	Model, Schema, model 
} from 'mongoose';
import { client } from 'src/index';

export interface ITempRole {
	userID: Snowflake;
	guildID: Snowflake;
	roleID: Snowflake;
	duration: number;
	createdAt: Date;
}

const tempRolesSchema = new Schema<ITempRole>(
	{
		userID: {
			type: String,
			required: true,
			immutable: true,
			unique: false
		},
		guildID: {
			type: String,
			required: true,
			immutable: true,
			unique: false
		},
		roleID: {
			type: String,
			required: true,
			immutable: true,
			unique: false
		},
		duration: {
			type: Number,
			required: true,
			immutable: true,
			unique: false,
			default: () => (process.env.ENV === 'test' ? 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)
		}
	},
	{
		timestamps: true,
		statics: {
			async removeExpiredRoles(): Promise<void> {
				const expiredRoles = await this.find();

				for (const roleAssignment of expiredRoles) {
					const {
						createdAt, duration, guildID, userID, roleID 
					} = roleAssignment;
					const expirationDate = new Date(createdAt.getTime() + duration);

					if (new Date() >= expirationDate) {
						const guild = await client.guilds.fetch(guildID);
						const member = await guild.members.fetch(userID);
						const role = await guild.roles.fetch(roleID);

						if (role && member.roles.cache.has(role.id)) {
							logger.debug(`Removing role ${role.name} from ${member.user.tag} (${member.id})`);

							try {
								await member.roles.remove(role);
								await roleAssignment.deleteOne();
							}
							catch (e) {
								logger.error('Failed to remove role', e);
							}
						}
					}
				}
			}
		}
	}
);

tempRolesSchema.index(
	{
		userID: 1,
		guildID: 1,
		roleID: 1
	},
	{ unique: true }
);

interface TempRoleModel extends Model<ITempRole> {
	removeExpiredRoles(): Promise<void>;
}

export const tempRoles = model('timedRoles', tempRolesSchema) as TempRoleModel;
