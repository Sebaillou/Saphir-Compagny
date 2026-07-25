let ranking = [];

const formatNumber = value =>
  new Intl.NumberFormat("fr-FR").format(value || 0);

const formatMoney = value =>
  `${new Intl.NumberFormat("fr-FR").format(value || 0)} €`;

function escapeHtml(value) {

  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;

}

function renderTable(data) {

  document.querySelector("#rankingBody").innerHTML =
    data.map((x,index)=>`

<tr>

<td>#${index+1}</td>

<td>${escapeHtml(x.client)}</td>

<td>${formatNumber(x.saphirsGlobaux)} 🔷</td>

<td>${formatMoney(x.argentGlobal)}</td>

</tr>

`).join("");

}

async function loadRanking(){

  const response =
    await fetch("/api/classement-global");

  const data =
    await response.json();

  ranking =
    [...data.classement]

      .sort(
        (a,b)=>
          b.saphirsGlobaux-a.saphirsGlobaux
      );

  document.querySelector("#totalClients").textContent =
    formatNumber(ranking.length);

  document.querySelector("#totalSaphirs").textContent =
    formatNumber(
      ranking.reduce(
        (t,x)=>t+x.saphirsGlobaux,
        0
      )
    );

  document.querySelector("#updatedAt").textContent =
    new Date(data.updatedAt)
      .toLocaleTimeString("fr-FR");

  renderTable(ranking);

}

document.querySelector("#refresh")
.addEventListener("click",loadRanking);

document.querySelector("#search")
.addEventListener("input",e=>{

const q=e.target.value.toLowerCase();

renderTable(
ranking.filter(x=>
x.client.toLowerCase().includes(q)
)
);

});

loadRanking();

setInterval(loadRanking,30000);
