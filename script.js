let ranking = [];

const formatNumber = value =>
  new Intl.NumberFormat("fr-FR").format(value || 0);

const formatMoney = value =>
  `${new Intl.NumberFormat("fr-FR").format(value || 0)} $`;


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
