const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const SPREADSHEET_ID =
  process.env.SPREADSHEET_ID ||
  "1G5zrFDupHKhrFrhdDPL93g0QKs3EI0BkdXipHSVNHuI";

const SHEET_NAME =
  process.env.SHEET_NAME ||
  "achat de saphir";

app.use(express.static(__dirname));

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    );
  }

  return require("./credentials.json");
}


// Convertit correctement les nombres venant de Google Sheets
function parseNumber(value) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  let cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/[€$]/g, "");

  // Gestion du format français :
  // 1 234,56 → 1234.56
  if (cleaned.includes(",")) {
    cleaned = cleaned
      .replace(/\./g, "")
      .replace(",", ".");
  }

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}


async function getRanking() {

  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly"
    ],
  });


  const sheets = google.sheets({
    version: "v4",
    auth
  });


  // Récupération de toute la feuille
  const response =
    await sheets.spreadsheets.values.get({

      spreadsheetId:
        SPREADSHEET_ID,

      range:
        `'${SHEET_NAME}'`,

    });


  const rows =
    response.data.values || [];


  if (rows.length === 0) {
    return [];
  }


  // Recherche automatique de la ligne
  // contenant les noms des colonnes
  const headerIndex =
    rows.findIndex(row =>

      row.some(cell =>

        String(cell)
          .trim()
          .toLowerCase() === "client"

      )

    );


  if (headerIndex === -1) {

    throw new Error(
      "Impossible de trouver la colonne Client."
    );

  }


  // Nettoyage des noms de colonnes
  const headers =
    rows[headerIndex].map(cell =>

      String(cell)
        .trim()
        .toLowerCase()

    );


  // Recherche des colonnes
  const clientIndex =
    headers.indexOf(
      "client"
    );


  const saphirIndex =
    headers.indexOf(
      "nombre de saphir"
    );


  const argentIndex =
    headers.indexOf(
      "argent pour le client"
    );


  if (clientIndex === -1) {

    throw new Error(
      "Colonne Client introuvable."
    );

  }


  if (saphirIndex === -1) {

    throw new Error(
      "Colonne Nombre de Saphir introuvable."
    );

  }


  if (argentIndex === -1) {

    throw new Error(
      "Colonne Argent pour le client introuvable."
    );

  }


  // Stockage des totaux par client
  const totals =
    new Map();


  // Lecture des lignes
  for (
    const row
    of rows.slice(headerIndex + 1)
  ) {


    const client =
      String(
        row[clientIndex] || ""
      ).trim();


    // Ignore les lignes sans client
    if (!client) {
      continue;
    }


    const saphirs =
      parseNumber(
        row[saphirIndex]
      );


    const argentClient =
      parseNumber(
        row[argentIndex]
      );


    // Création du client
    // s'il n'existe pas encore
    if (!totals.has(client)) {

      totals.set(
        client,
        {
          saphirs: 0,
          argentClient: 0
        }
      );

    }


    // Récupération des totaux actuels
    const total =
      totals.get(client);


    // Addition des saphirs
    total.saphirs +=
      saphirs;


    // Addition de l'argent
    total.argentClient +=
      argentClient;

  }


  // Transformation en classement
  return [
    ...totals.entries()
  ]

    .map(
      ([client, valeurs]) => ({

        client,

        saphirs:
          valeurs.saphirs,

        argentClient:
          valeurs.argentClient

      })
    )


    // Classement par nombre
    // de saphirs
    .sort(
      (a, b) =>
        b.saphirs -
        a.saphirs
    )


    // Ajout du rang
    .map(
      (item, index) => ({

        rang:
          index + 1,

        ...item

      })
    );

}


// API du classement
app.get(
  "/api/classement",

  async (req, res) => {

    try {

      const classement =
        await getRanking();


      res.json({

        updatedAt:
          new Date()
            .toISOString(),


        totalClients:
          classement.length,


        totalSaphirs:
          classement.reduce(

            (sum, joueur) =>
              sum +
              joueur.saphirs,

            0

          ),


        totalArgentClient:
          classement.reduce(

            (sum, joueur) =>
              sum +
              joueur.argentClient,

            0

          ),


        classement

      });


    } catch (error) {


      console.error(
        "Erreur classement :",
        error
      );


      res
        .status(500)
        .json({

          error:
            "Impossible de récupérer le classement.",

          details:
            error.message

        });

    }

  }
);


// Affichage du site
app.get(
  "*",

  (req, res) => {

    res.sendFile(

      path.join(
        __dirname,
        "index.html"
      )

    );

  }
);


// Démarrage du serveur
app.listen(
  PORT,

  () => {

    console.log(
      `Top Saphir disponible sur le port ${PORT}`
    );

  }
);
