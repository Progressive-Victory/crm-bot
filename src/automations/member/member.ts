// Created by: Brioche
// Automation for auto promoting/demoting dues paying members
import { Buffer } from "buffer";
import { parse } from "csv-parse/sync";
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
const getDuesPayingMembers = async () => {
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

  console.log({ startDate, endDate });
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
    console.log(csvRequest);
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
    throw new Error("Failed to request CSV from ActBlue");
  }

  const rawString = await csvData.text();
  const parsedData = parse(rawString, {
    columns: true,
    skip_empty_lines: true,
  });

  const donors = new Set();

  for (const data of parsedData) {
    if (
      data["Custom Field 1 Label"] === "Discord ID" &&
      data["Custom Field 1 Value"] !== ""
    ) {
      donors.add(data["Custom Field 1 Value"]);
    }
  }
};

const promoteDuesPayingMembers = async () => {};

const demoteDuesPayingMembers = async () => {};

export {
  demoteDuesPayingMembers,
  getDuesPayingMembers,
  promoteDuesPayingMembers,
};
