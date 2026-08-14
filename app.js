async function main() {
  const res = await fetch("data/relics.json");
  const data = await res.json();

  const characterMap = new Map(data.characters.map((c) => [c.id, c.name]));
  const bossMap = new Map(data.bosses.map((b) => [b.id, b.name]));
  const bossIconMap = new Map(data.bosses.map((b) => [b.id, b.icon]));
  const bossEnMap = new Map(data.bosses.map((b) => [b.id, b.nameEn]));

  const characterFilter = document.getElementById("characterFilter");
  const bossFilter = document.getElementById("bossFilter");
  const cardGrid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const resetBtn = document.getElementById("resetFilters");

  for (const c of data.characters) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    characterFilter.appendChild(opt);
  }
  for (const b of data.bosses) {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.nameEn ? `${b.name}（${b.nameEn}）` : b.name;
    bossFilter.appendChild(opt);
  }

  function render() {
    const charSel = characterFilter.value;
    const bossSel = bossFilter.value;

    const filtered = data.entries.filter((e) => {
      const charOk = charSel === "all" || e.characterId === charSel;
      const bossOk = bossSel === "all" || e.bossId === bossSel;
      return charOk && bossOk;
    });

    cardGrid.innerHTML = "";
    emptyState.hidden = filtered.length > 0;

    for (const entry of filtered) {
      cardGrid.appendChild(buildCard(entry));
    }
  }

  function buildCard(entry) {
    const bossName = bossMap.get(entry.bossId) ?? entry.bossId;
    const charName = characterMap.get(entry.characterId) ?? entry.characterId;

    const card = document.createElement("article");
    card.className = "card";

    const head = document.createElement("div");
    head.className = "card-head";

    const iconSrc = bossIconMap.get(entry.bossId);
    const icon = document.createElement(iconSrc ? "img" : "div");
    icon.className = "boss-icon" + (iconSrc ? "" : " placeholder");
    if (iconSrc) {
      icon.src = iconSrc;
      icon.alt = bossName;
    } else {
      icon.textContent = bossName;
    }
    head.appendChild(icon);

    const titles = document.createElement("div");
    titles.className = "card-titles";
    const bossEl = document.createElement("span");
    bossEl.className = "boss-name";
    bossEl.textContent = bossName;
    titles.appendChild(bossEl);

    const bossEn = bossEnMap.get(entry.bossId);
    if (bossEn) {
      const bossEnEl = document.createElement("span");
      bossEnEl.className = "boss-name-en";
      bossEnEl.textContent = bossEn;
      titles.appendChild(bossEnEl);
    }

    const charEl = document.createElement("span");
    charEl.className = "character-name";
    charEl.textContent = charName;
    titles.appendChild(charEl);
    head.appendChild(titles);

    card.appendChild(head);

    const relicRow = document.createElement("div");
    relicRow.className = "relic-images";
    const images = entry.relicImages ?? [];
    for (let i = 0; i < 2; i++) {
      const src = images[i];
      if (src) {
        const img = document.createElement("img");
        img.className = "relic-image";
        img.src = src;
        img.alt = `${bossName}の遺物${i + 1}`;
        relicRow.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "relic-image-placeholder";
        ph.textContent = "未登録";
        relicRow.appendChild(ph);
      }
    }
    card.appendChild(relicRow);

    const hpRow = document.createElement("div");
    hpRow.className = "hp-row";
    hpRow.innerHTML = `Lv15 HP: <strong>${entry.hpLv15 ?? "未登録"}</strong>`;
    card.appendChild(hpRow);

    const concept = document.createElement("p");
    concept.className = "concept";
    concept.textContent = entry.concept ?? "";
    card.appendChild(concept);

    return card;
  }

  characterFilter.addEventListener("change", render);
  bossFilter.addEventListener("change", render);
  resetBtn.addEventListener("click", () => {
    characterFilter.value = "all";
    bossFilter.value = "all";
    render();
  });

  render();
}

main();
