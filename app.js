async function main() {
  const res = await fetch("data/relics.json");
  const data = await res.json();

  const characterMap = new Map(data.characters.map((c) => [c.id, c.name]));
  const characterIconMap = new Map(data.characters.map((c) => [c.id, c.icon]));
  const bossMap = new Map(data.bosses.map((b) => [b.id, b.name]));
  const bossIconMap = new Map(data.bosses.map((b) => [b.id, b.icon]));
  const bossEnMap = new Map(data.bosses.map((b) => [b.id, b.nameEn]));

  const characterFilter = document.getElementById("characterFilter");
  const characterFilterBottom = document.getElementById("characterFilterBottom");
  const filterContainers = [characterFilter, characterFilterBottom];
  const bossFilter = document.getElementById("bossFilter");
  const bossFilterBottom = document.getElementById("bossFilterBottom");
  const bossFilterContainers = [bossFilter, bossFilterBottom];
  const cardGrid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const allBossIds = data.bosses.map((b) => b.id).filter((id) => id !== "unknown");

  const validCharacterIds = new Set(["all", ...data.characters.map((c) => c.id)]);
  const validBossIds = new Set(["all", ...data.bosses.map((b) => b.id)]);
  const params = new URLSearchParams(location.search);
  const paramCharacter = params.get("character");
  const paramBoss = params.get("boss");
  let selectedCharacter = validCharacterIds.has(paramCharacter) ? paramCharacter : "all";
  let selectedBoss = validBossIds.has(paramBoss) ? paramBoss : "all";

  loadLastUpdate();

  async function loadLastUpdate() {
    const el = document.getElementById("lastUpdate");
    try {
      const res = await fetch(
        "https://api.github.com/repos/esusan/nightreign-relics/commits?path=data/relics.json&per_page=1"
      );
      const commits = await res.json();
      const date = commits?.[0]?.commit?.committer?.date;
      if (!date) return;
      const formatted = new Date(date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      el.textContent = `最終更新: ${formatted}`;
      el.hidden = false;
    } catch {
      // 取得できなくても表示は隠したままでよい
    }
  }

  function formatDate(iso) {
    if (!iso) return "";
    return iso.replaceAll("-", "/");
  }

  function scrollToTop() {
    window.scrollTo(0, 0);
  }

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
      updateUrl();
      render();
      scrollToTop();
    });

    return btn;
  }

  for (const container of filterContainers) {
    container.appendChild(buildCharacterButton("all", "すべて", ""));
    for (const c of data.characters) {
      container.appendChild(buildCharacterButton(c.id, c.name, c.icon));
    }
  }

  function buildBossButton(id, label, iconSrc) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "character-btn";
    btn.dataset.bossId = id;

    if (iconSrc) {
      const icon = document.createElement("img");
      icon.className = "boss-icon";
      icon.src = iconSrc;
      icon.alt = label;
      btn.appendChild(icon);
    }

    const name = document.createElement("span");
    name.className = "character-btn-label";
    name.textContent = label;
    btn.appendChild(name);

    btn.addEventListener("click", () => {
      selectedBoss = id;
      updateActiveButton();
      updateUrl();
      render();
      scrollToTop();
    });

    return btn;
  }

  for (const container of bossFilterContainers) {
    container.appendChild(buildBossButton("all", "すべて", ""));
    for (const b of data.bosses) {
      container.appendChild(buildBossButton(b.id, b.name, b.icon));
    }
  }

  function updateUrl() {
    const url = new URL(location.href);
    if (selectedCharacter === "all") {
      url.searchParams.delete("character");
    } else {
      url.searchParams.set("character", selectedCharacter);
    }
    if (selectedBoss === "all") {
      url.searchParams.delete("boss");
    } else {
      url.searchParams.set("boss", selectedBoss);
    }
    history.replaceState(null, "", url);
  }

  function updateActiveButton() {
    for (const container of filterContainers) {
      for (const btn of container.querySelectorAll(".character-btn")) {
        btn.classList.toggle("active", btn.dataset.characterId === selectedCharacter);
      }
    }
    for (const container of bossFilterContainers) {
      for (const btn of container.querySelectorAll(".character-btn")) {
        btn.classList.toggle("active", btn.dataset.bossId === selectedBoss);
      }
    }
  }

  function render() {
    const filtered = data.entries.filter((e) => {
      const characterMatch = selectedCharacter === "all" || e.characterId === selectedCharacter;
      const bossMatch = selectedBoss === "all" || (e.bossIds ?? []).includes(selectedBoss);
      return characterMatch && bossMatch;
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
        label.textContent = group.createdAt
          ? `${group.label}（${formatDate(group.createdAt)}）`
          : group.label;
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

    if (entry.createdAt) {
      const dateLabel = document.createElement("span");
      dateLabel.className = "stat-label stat-date";
      dateLabel.textContent = `登録日: ${formatDate(entry.createdAt)}`;
      stat.appendChild(dateLabel);
    }

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
