let ranking = [];

const formatNumber = value =>
  new Intl.NumberFormat("fr-FR").format(value || 0);

const formatMoney = value =>
  `${new Intl.NumberFormat("fr-FR").format(value || 0)} €`;


function renderPodium(data) {

  const medals = ["🥇", "🥈", "🥉"];

  document.querySelector("#podium").innerHTML =
    data.slice(0, 3).map((x, i) => `

      <article class="podium-card ${i === 0 ? "first" : ""}">

        <div class="medal">
          ${medals[i]}
        </div>

        <h3>
          ${escapeHtml(x.client)}
        </h3>

        <p>
          ${formatNumber(x.saphirs)} 🔷
        </p>

        <p>
          ${formatMoney(x.argentClient)}
        </p>

      </article>

    `).join("");
}


function renderTable(data) {

  document.querySelector("#rankingBody").innerHTML =
    data.map(x => `

      <tr>

        <td>
          #${x.rang}
        </td>

        <td>
          ${escapeHtml(x.client)}
        </td>

        <td>
          ${formatNumber(x.saphirs)} 🔷
        </td>

        <td>
          ${formatMoney(x.argentClient)}
        </td>

      </tr>

    `).join("");
}


function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value;

  return div.innerHTML;

}


async function loadRanking() {
  async function getTotalSaphirsGlobaux() {

  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly"
    ]
  });

  const sheets = google.sheets({
    version: "v4",
    auth
  });

  const totalParClient = new Map();

  for (const fichier of GLOBAL_SPREADSHEETS) {

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fichier.id,
      range: `'${fichier.sheet}'`
    });

    const rows = response.data.values || [];

    if (!rows.length) continue;

    const headerIndex = rows.findIndex(row =>
      row.some(cell =>
        String(cell).trim().toLowerCase() === "client"
      )
    );

    if (headerIndex === -1) continue;

    const headers = rows[headerIndex].map(cell =>
      String(cell).trim().toLowerCase()
    );

    const clientIndex = headers.indexOf("client");
    const saphirIndex = headers.indexOf("nombre de saphir");

    if (clientIndex === -1 || saphirIndex === -1)
      continue;

    for (const row of rows.slice(headerIndex + 1)) {

      const client = String(row[clientIndex] || "").trim();

      if (!client) continue;

      const saphirs = parseNumber(row[saphirIndex]);

      totalParClient.set(
        client,
        (totalParClient.get(client) || 0) + saphirs
      );
    }
  }

  return [...totalParClient.values()]
    .reduce((a, b) => a + b, 0);

}

  const error =
    document.querySelector("#error");

  error.hidden =
    true;


  try {

    const response =
      await fetch(
        "/api/classement",
        {
          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.details ||
        data.error
      );

    }


    ranking =
      data.classement;


    // Nombre total de clients
    document
      .querySelector("#totalClients")
      .textContent =
        formatNumber(
          data.totalClients
        );


    // Nombre total de saphirs
    document
      .querySelector("#totalSaphirs")
      .textContent =
        formatNumber(
          data.totalSaphirs
        );


    // Argent total de tous les clients
    const totalArgentElement =
      document.querySelector(
        "#totalArgentClient"
      );

    if (totalArgentElement) {

      totalArgentElement.textContent =
        formatMoney(
          data.totalArgentClient
        );

    }


    // Heure de mise à jour
    document
      .querySelector("#updatedAt")
      .textContent =

        new Date(
          data.updatedAt
        ).toLocaleTimeString(
          "fr-FR"
        );


    // Affichage
    renderPodium(
      ranking
    );

    renderTable(
      ranking
    );


  } catch (e) {

    error.textContent =
      e.message ||
      "Une erreur est survenue.";

    error.hidden =
      false;

  }

}


// Recherche d'un client
document
  .querySelector("#search")
  .addEventListener(
    "input",
    e => {

      const q =
        e.target.value
          .trim()
          .toLowerCase();


      const results =
        ranking.filter(
          x =>
            x.client
              .toLowerCase()
              .includes(q)
        );


      renderTable(
        results
      );

    }
  );


// Bouton Actualiser
document
  .querySelector("#refresh")
  .addEventListener(
    "click",
    loadRanking
  );


// Premier chargement
loadRanking();


// Actualisation automatique
// toutes les 30 secondes
setInterval(
  loadRanking,
  30000
);
