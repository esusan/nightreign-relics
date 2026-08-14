async function main() {
  const res = await fetch("data/relics.json");
  const data = await res.json();

  const characterMap = new Map(data.characters.map((c) => [c.id, c.name]));
  const characterIconMap = new Map(data.characters.map((c) => [c.id, c.icon]));
  const bossMap = new Map(data.bosses.map((b) => [b.id, b.name]));
  const bossIconMap = new Map(data.bosses.map((b) => [b.id, b.icon]));
  const bossEnMap = new Map(data.bosses.map((b) => [b.id, b.nameEn]));

  const characterFilter = document.getElementById("characterFilter");
  const cardGrid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const allBossIds = data.bosses.map((b) => b.id).filter((id) => id !== "unknown");

  let selectedCharacter = "all";

  function buildCharacterButton(id, label, iconSrc) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "character-btn";
    btn.dataset.characterId = id;

    if (iconSrc) {
      const icon = document.createElement("img");
      icon.className = "character-icon";
      icon.src = iconSrc;
      icon.alt = label;
      btn.appendChild(icon);
    }

    const name = document.createElement("span");
    name.className = "character-btn-label";
    name.textContent = label;
    btn.appendChild(name);

    btn.addEventListener("click", () => {
      selectedCharacter = id;
      updateActiveButton();
      render();
    });

    return btn;
  }

  characterFilter.appendChild(buildCharacterButton("all", "すべて", ""));
  for (const c of data.characters) {
    characterFilter.appendChild(buildCharacterButton(c.id, c.name, c.icon));
  }

  function updateActiveButton() {
    for (const btn of characterFilter.querySelectorAll(".character-btn")) {
      btn.classList.toggle("active", btn.dataset.characterId === selectedCharacter);
    }
  }

  function render() {
    const filtered = data.entries.filter((e) => {
      return selectedCharacter === "all" || e.characterId === selectedCharacter;
    });

    cardGrid.innerHTML = "";
    emptyState.hidden = filtered.length > 0;

    for (const entry of filtered) {
      cardGrid.appendChild(buildCard(entry));
    }
  }

  function buildCard(entry) {
    const charName = characterMap.get(entry.characterId) ?? entry.characterId;
    const bossIds = entry.bossIds ?? [];
    const bossNames = bossIds.map((id) => bossMap.get(id) ?? id);

    const card = document.createElement("article");
    card.className = "card";

    const top = document.createElement("div");
    top.className = "card-top";
    const charBadge = document.createElement("span");
    charBadge.className = "character-badge";
    const charIconSrc = characterIconMap.get(entry.characterId);
    if (charIconSrc) {
      const charIcon = document.createElement("img");
      charIcon.className = "character-badge-icon";
      charIcon.src = charIconSrc;
      charIcon.alt = "";
      charBadge.appendChild(charIcon);
    }
    charBadge.appendChild(document.createTextNode(charName));
    top.appendChild(charBadge);

    if (entry.variant) {
      const variantBadge = document.createElement("span");
      variantBadge.className = "variant-badge";
      variantBadge.textContent = entry.variant;
      top.appendChild(variantBadge);
    }

    card.appendChild(top);

    const isAllBosses = allBossIds.length > 0 && allBossIds.every((id) => bossIds.includes(id));

    if (isAllBosses) {
      const allBadge = document.createElement("span");
      allBadge.className = "boss-all-badge";
      allBadge.textContent = "全ボス共通";
      card.appendChild(allBadge);
    } else {
      const bossRow = document.createElement("div");
      bossRow.className = "boss-row";
      for (const bossId of bossIds) {
        const bossName = bossMap.get(bossId) ?? bossId;
        const bossEn = bossEnMap.get(bossId);
        const iconSrc = bossIconMap.get(bossId);

        const chip = document.createElement("div");
        chip.className = "boss-chip";
        if (bossEn) chip.title = bossEn;

        const icon = document.createElement(iconSrc ? "img" : "div");
        icon.className = "boss-chip-icon" + (iconSrc ? "" : " placeholder");
        if (iconSrc) {
          icon.src = iconSrc;
          icon.alt = bossName;
        } else {
          icon.textContent = bossName;
        }
        chip.appendChild(icon);

        const name = document.createElement("span");
        name.className = "boss-chip-name";
        name.textContent = bossName;
        chip.appendChild(name);

        bossRow.appendChild(chip);
      }
      card.appendChild(bossRow);
    }

    const relicRow = document.createElement("div");
    relicRow.className = "relic-images";
    const images = entry.relicImages ?? [];
    for (let i = 0; i < 2; i++) {
      const src = images[i];
      if (src) {
        const img = document.createElement("img");
        img.className = "relic-image";
        img.src = src;
        img.alt = `${bossNames.join("・")}の遺物${i + 1}`;
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

  updateActiveButton();
  render();
}

main();
