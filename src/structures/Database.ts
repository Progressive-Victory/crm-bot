import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { Snowflake } from 'discord.js';

import Logger from './Logger';

config();
const client = new MongoClient(process.env.DB_URI);

export default class Database {
	static get client() {
		return client;
	}

	static get db() {
		return this.client.db('bot');
	}

	static async connect() {
		await this.client.connect();
		await this.db.command({ ping: 1 });
		Logger.info('Database connected successfully!');
	}

	static addLeave(userID: Snowflake, guildID: Snowflake) {
		return Database.db.collection('leaves').insertOne({
			userID,
			guildID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static addJoin(userID: Snowflake, guildID: Snowflake) {
		return Database.db.collection('joins').insertOne({
			userID,
			guildID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static incrementMessages(userID: Snowflake, guildID: Snowflake, channelID: Snowflake) {
		return Database.db.collection('messages').updateOne(
			{
				userID,
				guildID,
				channelID
			},
			{
				$inc: { count: 1 },
				$set: { updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
	}

	static addVCJoin(userID: Snowflake, guildID: Snowflake, channelID: Snowflake) {
		return Database.db.collection('vcjoins').insertOne({
			userID,
			guildID,
			channelID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static addVCLeave(userID: Snowflake, guildID: Snowflake, channelID: Snowflake) {
		return Database.db.collection('vcleaves').insertOne({
			userID,
			guildID,
			channelID,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	static async getMetrics(guildID: Snowflake, userID?: Snowflake) {
		const query: any = { guildID };
		if (userID) query.userID = userID;

		const [joins, leaves, messagesList, vcJoins, vcLeaves] = await Promise.all([
			Database.db.collection('joins').find(query).toArray(),
			Database.db.collection('leaves').find(query).toArray(),
			Database.db.collection('messages').find(query).toArray(),
			Database.db.collection('vcjoins').find(query).toArray(),
			Database.db.collection('vcleaves').find(query).toArray()
		]);

		const messages = userID ? messagesList.find((row) => row.userID === userID)?.count : messagesList;

		return {
			messages,
			joins,
			leaves,
			vcJoins,
			vcLeaves
		};
	}
}
