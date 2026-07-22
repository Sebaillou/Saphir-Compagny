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

  const sheets = google.sheets({
    version: "v4",
    auth
  });

  // Lecture directe :
  // Colonne C = Client
  // Colonne D = Nombre de Saphir
  // On commence à la ligne 2 pour ignorer les titres
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${SHEET_NAME}'!D2:E`,
  });

  const rows = response.data.values || [];
  const totals = new Map();

  for (const row of rows) {
    const client = String(row[0] || "").trim();

    const raw = String(row[1] || "0")
      .replace(/\s/g, "")
      .replace(",", ".");

    const amount = Number(raw);

    // Ignore les lignes vides ou incorrectes
    if (!client || !Number.isFinite(amount)) {
      continue;
    }

    // Additionne les saphirs si le client apparaît plusieurs fois
    totals.set(
      client,
      (totals.get(client) || 0) + amount
    );
  }

  // Création du classement
  return [...totals.entries()]
    .map(([client, saphirs]) => ({
      client,
      saphirs
    }))
    .sort((a, b) => b.saphirs - a.saphirs)
    .map((item, index) => ({
      rang: index + 1,
      ...item
    }));
}
app.get("/api/classement", async (req, res) => {
  try {
    const classement = await getRanking();

    res.json({
      updatedAt: new Date().toISOString(),
      totalClients: classement.length,
      totalSaphirs: classement.reduce(
        (sum, joueur) => sum + joueur.saphirs,
        0
      ),
      classement,
    });
  } catch (error) {
    console.error("Erreur classement :", error);

    res.status(500).json({
      error: "Impossible de récupérer le classement.",
      details: error.message,
    });
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Top Saphir disponible sur le port ${PORT}`));
