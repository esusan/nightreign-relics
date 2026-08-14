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
    const isAllBosses = allBossIds.length > 0 && allBossIds.every((id) => bossIds.includes(id));

    const card = document.createElement("article");
    card.className = "card";

    // --- header: who + vs boss(es) + variant/all tag, all on one line ---
    const header = document.createElement("div");
    header.className = "card-header";

    const who = document.createElement("div");
    who.className = "header-who";
    const charIconSrc = characterIconMap.get(entry.characterId);
    if (charIconSrc) {
      const charIcon = document.createElement("img");
      charIcon.src = charIconSrc;
      charIcon.alt = "";
      who.appendChild(charIcon);
    }
    who.appendChild(document.createTextNode(charName));
    header.appendChild(who);

    const sep = document.createElement("span");
    sep.className = "header-sep";
    sep.textContent = "vs";
    header.appendChild(sep);

    const bosses = document.createElement("div");
    bosses.className = "header-bosses";
    bosses.classList.toggle("single", bossIds.length === 1);

    if (isAllBosses) {
      const allTag = document.createElement("span");
      allTag.className = "header-boss-all";
      allTag.textContent = "全ボス共通";
      bosses.appendChild(allTag);
    } else {
      for (const bossId of bossIds) {
        const bossName = bossMap.get(bossId) ?? bossId;
        const bossEn = bossEnMap.get(bossId);
        const iconSrc = bossIconMap.get(bossId);

        const chip = document.createElement("span");
        chip.className = "header-boss";
        if (bossEn) chip.title = bossEn;

        if (iconSrc) {
          const icon = document.createElement("img");
          icon.src = iconSrc;
          icon.alt = bossName;
          chip.appendChild(icon);
        }
        const name = document.createElement("span");
        name.textContent = bossName;
        chip.appendChild(name);

        bosses.appendChild(chip);
      }
    }
    header.appendChild(bosses);

    if (entry.variant) {
      const variantTag = document.createElement("span");
      variantTag.className = "header-tag";
      variantTag.textContent = entry.variant;
      header.appendChild(variantTag);
    }

    card.appendChild(header);

    // --- relic screenshot block(s), boxed and labeled ---
    function buildRelicRow(images, altPrefix) {
      const row = document.createElement("div");
      row.className = "relic-images";
      for (let i = 0; i < 2; i++) {
        const src = images[i];
        if (src) {
          const img = document.createElement("img");
          img.className = "relic-image";
          img.src = src;
          img.alt = `${altPrefix}の遺物${i + 1}`;
          row.appendChild(img);
        } else {
          const ph = document.createElement("div");
          ph.className = "relic-image-placeholder";
          ph.textContent = "未登録";
          row.appendChild(ph);
        }
      }
      return row;
    }

    const bossLabel = bossNames.join("・");

    if (entry.variantGroups) {
      for (const group of entry.variantGroups) {
        const block = document.createElement("div");
        block.className = "relic-block";

        const label = document.createElement("span");
        label.className = "relic-block-label";
        label.textContent = group.label;
        block.appendChild(label);

        block.appendChild(buildRelicRow(group.images ?? [], `${bossLabel}(${group.label})`));
        card.appendChild(block);
      }
    } else {
      const block = document.createElement("div");
      block.className = "relic-block";
      block.appendChild(buildRelicRow(entry.relicImages ?? [], bossLabel));
      card.appendChild(block);
    }

    // --- footer: HP stat + divider + concept text ---
    const footer = document.createElement("div");
    footer.className = "card-footer";

    const stat = document.createElement("div");
    stat.className = "stat-row";
    const statLabel = document.createElement("span");
    statLabel.className = "stat-label";
    statLabel.textContent = "Lv15 HP";
    const statValue = document.createElement("span");
    statValue.className = "stat-value";
    statValue.textContent = entry.hpLv15 ?? "未登録";
    stat.appendChild(statLabel);
    stat.appendChild(statValue);
    footer.appendChild(stat);

    const divider = document.createElement("hr");
    divider.className = "divider";
    footer.appendChild(divider);

    const concept = document.createElement("p");
    concept.className = "concept";
    concept.textContent = entry.concept ?? "";
    footer.appendChild(concept);

    card.appendChild(footer);

    return card;
  }

  updateActiveButton();
  render();
}

main();
