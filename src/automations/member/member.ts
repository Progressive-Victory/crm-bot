// Created by: Brioche
// Automation for auto promoting/demoting dues paying members
import { Buffer } from "buffer";
import { parse } from "csv-parse/sync";
import { ExtendedClient } from "../../Classes/Client/Client.js";
import { client } from "../../index.js";
import Donor from "../../models/Donor.js";
import dbConnect from "../../util/libmongo.js";
// CSV API endpoint for ActBlue
const actBlueCSVEndpoint = "https://secure.actblue.com/api/v1/csvs";
// Act Blue uses basic auth (e.g. username:password)
const authorization = Buffer.from(
  `${process.env.ACT_BLUE_CLIENT}:${process.env.ACT_BLUE_SECRET}`
).toString("base64");

const donationSchema = [
  { name: "Dues Paying Member", amount: 5.0 },
  { name: "Premium Member", amount: 10.0 },
  { name: "Signature Member", amount: 20.0 },
  { name: "Inner Circle™", amount: 100.0 },
];

// Gets all contributions within the last 30 days of today
// compares against the dues paying members on file and their contribution level
// promotes/demotes accordingly, non-payment or reduced payment is demoted to appropriate role
export const getDuesPayingMembers = async () => {
  dbConnect();
  // Get start and end dates from today, final format is YYYY-MM-DD
  const daysSince = 30 * 24 * 60 * 60 * 1000;
  const today = new Date();
  const start = new Date(today.getTime() - daysSince);

  const startDate = `${start.getFullYear()}-${
    start.getMonth() + 1
  }-${start.getDate()}`;
  const endDate = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  // Request the CSV from ActBlue
  const csvRequest = await fetch(actBlueCSVEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authorization}`,
    },
    body: JSON.stringify({
      csv_type: "paid_contributions",
      date_range_start: startDate,
      date_range_end: endDate,
    }),
  });

  if (!csvRequest.ok) {
    console.error(csvRequest);
    throw new Error("Failed to request CSV from ActBlue");
  }

  const { id: csvId } = await csvRequest.json();

  // Download the CSV
  const csvResponse = async () => {
    const res = await fetch(`${actBlueCSVEndpoint}/${csvId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authorization}`,
      },
    });
    const body = await res.json();
    return body;
  };

  const { status, download_url } = await csvResponse();
  let currentStatus = status;
  let downloadLink = download_url;
  while (currentStatus !== "complete") {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    ({ status: currentStatus, download_url: downloadLink } =
      await csvResponse());
  }

  const csvData = await fetch(downloadLink);

  if (!csvData.ok) {
    console.error(csvData);
    throw new Error("Failed to request CSV from ActBlue");
  }

  const rawString = await csvData.text();
  const parsedData = parse(rawString, {
    columns: true,
    skip_empty_lines: true,
  });

  const donors = new Set();

  interface Member {
    role: string;
    discordID: string;
    lastAmount: number;
    lastDonated: Date;
  }
  for (const data of parsedData) {
    const member: Member = {
      role: "",
      discordID: "",
      lastAmount: 0,
      lastDonated: new Date(),
    };
    if (
      data["Custom Field 1 Label"] === "Discord ID" &&
      data["Custom Field 1 Value"] !== ""
    ) {
      member.discordID = data["Custom Field 1 Value"];
      for (const level of donationSchema) {
        if (data["Amount"] >= level.amount) {
          member.role = level.name;
        }
      }

      if (member.role !== "") {
        donors.add(member);
      }

      member.lastAmount = data["Amount"];
      member.lastDonated = new Date(data["Date"]);
    }
  }

  for (const member of donors as Set<Member>) {
    const existing = await Donor.findOne({ discordID: member.discordID });
    if (existing) {
      const previousLastDonated = new Date(existing.lastDonated);
      const currentLastDonated = new Date(member.lastDonated);

      // Make sure this is the most recent donation
      if (previousLastDonated.getTime() >= currentLastDonated.getTime()) {
        continue;
      }

      existing.role = member.role;
      existing.lastDonated = member.lastDonated;
      existing.lastAmount = member.lastAmount;
      await existing.save();
      continue;
    }
    Donor.create({
      discordID: member.discordID,
      role: member.role,
      lastDonated: member.lastDonated,
      lastAmount: member.lastAmount,
    });
  }

  // Use updated donors to update roles
  updateRoles(client);
};

const ensureProperID = (name: string) => {
  if (name[0] !== ".") {
    return "." + name;
  } else {
    return name;
  }
};

const updateRoles = async (client: ExtendedClient) => {
  const members = await Donor.find();
  const guild = await client.guilds.fetch(process.env.GUILD_ID as string);
  const guildMembers = await guild.members.list();
  for (const member of members) {
    const user = guildMembers.find(
      (m) => m.user.username === ensureProperID(member.discordID)
    );

    if (user) {
      const userRoles = user.roles.cache.map((role) => role.name);
      // Zerothly check if they have made a contribution in last 31 days (extra room in case of timezone issues)
      if (
        member.lastDonated.getTime() + 31 * 24 * 60 * 60 * 1000 <
        Date.now()
      ) {
        // remove any donator roles
        for (const roleString of donationSchema.map((s) => s.name)) {
          const toRemove = guild.roles.cache.find((r) => r.name === roleString);
          if (!toRemove) {
            continue;
          }
          await user.roles.remove(toRemove);
        }

        continue;
      }

      // First make sure they don't have any of the other roles
      // If they do we remove them
      for (const roleString of userRoles) {
        if (
          roleString !== member.role &&
          donationSchema.map((s) => s.name).includes(roleString)
        ) {
          const toRemove = guild.roles.cache.find((r) => r.name === roleString);
          if (!toRemove) {
            continue;
          }
          await user.roles.remove(toRemove);
        }
      }

      // Second check if they have the correct role
      if (userRoles.includes(member.role)) {
        continue;
      }

      const role = guild.roles.cache.find((r) => r.name === member.role);
      if (role) {
        await user.roles.add(role);
      }
    }
  }
};
