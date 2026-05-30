async function renderGames() {
  document.getElementById("app").innerHTML =
    `<div class="loading">${t("loading")}</div>`;

  const mockMatch = {
    homeTeam: "Atlético Mineiro",
    awayTeam: "Cruzeiro",
    homeScore: 3,
    awayScore: 0,
    stats: [
      { label: "Posse de bola", home: 68, away: 32, type: "percent" },
      { label: "Gols esperados (xG)", home: 1.02, away: 0.42, type: "decimal" },
      { label: "Grandes chances", home: 1, away: 0, type: "number" },
      { label: "Finalizações", home: 15, away: 6, type: "number" },
      { label: "Defesas do goleiro", home: 3, away: 3, type: "number" },
      { label: "Escanteios", home: 6, away: 1, type: "number" },
      { label: "Faltas", home: 4, away: 12, type: "number" },
      { label: "Passes", home: 627, away: 307, type: "number" },
      { label: "Desarmes", home: 8, away: 15, type: "number" },
      { label: "Faltas (Tiros Diretos)", home: 12, away: 4, type: "number" },
      { label: "Cartões amarelos", home: 2, away: 4, type: "number" },
    ],
  };

  document.getElementById("app").innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title"><span class="emoji">🏟️</span> ${t("nav_games")}</h2>
        <p class="page-subtitle">Central de Estatísticas e Partidas</p>
      </div>
    </div>
    
    <div class="card" style="background: #18202f; border: none; color: #fff; max-width: 500px; margin: 0 auto; padding: 2rem; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; color: #fff;">Visão geral da partida</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${mockMatch.stats.map((stat) => renderStatBar(stat)).join("")}
      </div>
    </div>
  `;
}

function renderStatBar(stat) {
  const colorHome = stat.home >= stat.away ? "#4ade80" : "#475569";
  const colorAway = stat.away >= stat.home ? "#818cf8" : "#475569";
  const total = stat.home + stat.away;
  const homePct = total === 0 ? 50 : (stat.home / total) * 100;
  const awayPct = total === 0 ? 50 : (stat.away / total) * 100;
  const formatVal = (val) => (stat.type === "percent" ? `${val}%` : val);

  if (stat.label === "Posse de bola") {
    return `
      <div style="margin-bottom: 0.5rem;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.8rem; align-items: center;">
          <span style="background: #4ade80; color: #000; padding: 0.2rem 0.8rem; border-radius: 99px;">${formatVal(stat.home)}</span>
          <span style="color: #fff;">${stat.label}</span>
          <span style="background: #818cf8; color: #fff; padding: 0.2rem 0.8rem; border-radius: 99px;">${formatVal(stat.away)}</span>
        </div>
        <div style="display: flex; height: 12px; border-radius: 99px; overflow: hidden; background: #334155;">
          <div style="width: ${homePct}%; background: #4ade80; height: 100%;"></div>
          <div style="width: ${awayPct}%; background: #818cf8; height: 100%;"></div>
        </div>
      </div>
    `;
  }

  return `
    <div>
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem;">
        <span style="color: #fff;">${formatVal(stat.home)}</span>
        <span style="color: #cbd5e1; font-size: 0.8rem;">${stat.label}</span>
        <span style="color: #fff;">${formatVal(stat.away)}</span>
      </div>
      <div style="display: flex; gap: 6px; height: 6px; border-radius: 99px;">
        <div style="flex: 1; display: flex; justify-content: flex-end; background: #334155; border-radius: 99px; overflow: hidden;">
          <div style="width: ${homePct}%; background: ${colorHome}; height: 100%; border-radius: 99px;"></div>
        </div>
        <div style="flex: 1; background: #334155; border-radius: 99px; overflow: hidden;">
          <div style="width: ${awayPct}%; background: ${colorAway}; height: 100%; border-radius: 99px;"></div>
        </div>
      </div>
    </div>
  `;
}
