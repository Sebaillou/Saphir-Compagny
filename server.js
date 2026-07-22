const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1G5zrFDupHKhrFrhdDPL93g0QKs3EI0BkdXipHSVNHuI";
const SHEET_NAME = process.env.SHEET_NAME || "achat de saphir";

app.use(express.static(__dirname));

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  return require("./credentials.json");
}

async function getRanking() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${SHEET_NAME}'`,
  });

  const rows = response.data.values || [];
  if (!rows.length) return [];

  const headers = rows[0].map(h => String(h).trim());
  const clientIndex = headers.findIndex(h => h.toLowerCase() === "client");
  const sapphireIndex = headers.findIndex(h => h.toLowerCase() === "nombre de saphir");

  if (clientIndex === -1 || sapphireIndex === -1) {
    throw new Error(`Colonnes introuvables. Colonnes disponibles : ${headers.join(", ")}`);
  }

  const totals = new Map();

  for (const row of rows.slice(1)) {
    const client = String(row[clientIndex] || "").trim();
    if (!client) continue;

    const raw = String(row[sapphireIndex] || "0")
      .replace(/\s/g, "")
      .replace(",", ".");
    const amount = Number(raw);
    if (!Number.isFinite(amount)) continue;

    totals.set(client, (totals.get(client) || 0) + amount);
  }

  return [...totals.entries()]
    .map(([client, saphirs]) => ({ client, saphirs }))
    .sort((a, b) => b.saphirs - a.saphirs)
    .map((item, index) => ({ rang: index + 1, ...item }));
}

app.get("/api/classement", async (req, res) => {
  try {
    const classement = await getRanking();
    res.json({
      updatedAt: new Date().toISOString(),
      totalClients: classement.length,
      totalSaphirs: classement.reduce((sum, x) => sum + x.saphirs, 0),
      classement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Impossible de récupérer le classement.",
      details: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Top Saphir disponible sur le port ${PORT}`));
