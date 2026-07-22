let ranking = [];

const formatNumber = value => new Intl.NumberFormat("fr-FR").format(value);

function renderPodium(data) {
  const medals = ["🥇", "🥈", "🥉"];
  document.querySelector("#podium").innerHTML = data.slice(0, 3).map((x, i) => `
    <article class="podium-card ${i === 0 ? "first" : ""}">
      <div class="medal">${medals[i]}</div>
      <h3>${escapeHtml(x.client)}</h3>
      <p>${formatNumber(x.saphirs)} saphirs</p>
    </article>`).join("");
}

function renderTable(data) {
  document.querySelector("#rankingBody").innerHTML = data.map(x => `
    <tr><td>#${x.rang}</td><td>${escapeHtml(x.client)}</td><td>${formatNumber(x.saphirs)} 💎</td></tr>
  `).join("");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

async function loadRanking() {
  const error = document.querySelector("#error");
  error.hidden = true;
  try {
    const response = await fetch("/api/classement", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.details || data.error);
    ranking = data.classement;
    document.querySelector("#totalClients").textContent = formatNumber(data.totalClients);
    document.querySelector("#totalSaphirs").textContent = formatNumber(data.totalSaphirs);
    document.querySelector("#updatedAt").textContent = new Date(data.updatedAt).toLocaleTimeString("fr-FR");
    renderPodium(ranking);
    renderTable(ranking);
  } catch (e) {
    error.textContent = e.message || "Une erreur est survenue.";
    error.hidden = false;
  }
}

document.querySelector("#search").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  renderTable(ranking.filter(x => x.client.toLowerCase().includes(q)));
});
document.querySelector("#refresh").addEventListener("click", loadRanking);

loadRanking();
setInterval(loadRanking, 30000);