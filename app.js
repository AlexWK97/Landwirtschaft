const STORAGE_KEY = "farmApp.seedVarieties";

const defaultSeeds = [
  {
    id: createId(),
    name: "Winterweizen KWS Example",
    crop: "Winterweizen",
    germinationRate: 94,
    thousandKernelWeight: 45,
    notes: "Standard-Sorte, mittlere Aussaat"
  },
  {
    id: createId(),
    name: "Wintergerste Sunshine",
    crop: "Wintergerste",
    germinationRate: 97,
    thousandKernelWeight: 38,
    notes: "Frühe Aussaat empfohlen"
  },
  {
    id: createId(),
    name: "Raps Hybrid RZ-500",
    crop: "Winterraps",
    germinationRate: 92,
    thousandKernelWeight: 5.2,
    notes: "Spätere Aussaat, gute Winterhärte"
  }
];

let seeds = [];
let seedForm;
let cancelEditButton;
let seedTableBody;
let calculatorForm;
let varietySelect;
let seedIdField;
let seedNameInput;
let seedCropInput;
let seedGerminationInput;
let seedTkgInput;
let seedNotesInput;
let targetDensityInput;
let areaInput;
let areaUnitSelect;
let resultSection;
let resultSeedsPerM2;
let resultSeedsPerHa;
let resultKgPerHa;
let resultTotalKg;
let navigationTargets = [];
let backButtons = [];
let viewSections = {};
let viewHistory = [];
let currentView = null;

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  seedForm = document.querySelector("#seed-form");
  cancelEditButton = document.querySelector("#cancel-edit");
  seedTableBody = document.querySelector("#seed-table-body");
  calculatorForm = document.querySelector("#calculator-form");
  varietySelect = document.querySelector("#calculator-variety");
  seedIdField = document.querySelector("#seed-id");
  seedNameInput = document.querySelector("#seed-name");
  seedCropInput = document.querySelector("#seed-crop");
  seedGerminationInput = document.querySelector("#seed-germination");
  seedTkgInput = document.querySelector("#seed-tkg");
  seedNotesInput = document.querySelector("#seed-notes");
  targetDensityInput = document.querySelector("#target-density");
  areaInput = document.querySelector("#calculator-area");
  areaUnitSelect = document.querySelector("#area-unit");
  resultSection = document.querySelector("#result-section");
  resultSeedsPerM2 = document.querySelector("#result-seeds-per-m2");
  resultSeedsPerHa = document.querySelector("#result-seeds-per-ha");
  resultKgPerHa = document.querySelector("#result-kg-per-ha");
  resultTotalKg = document.querySelector("#result-total-kg");
  navigationTargets = Array.from(document.querySelectorAll("[data-target]"));
  backButtons = Array.from(document.querySelectorAll("[data-action='back']"));
  viewSections = {
    home: document.querySelector("#home-view"),
    lagerMenu: document.querySelector("#lager-menu-view"),
    lager: document.querySelector("#lager-view"),
    rechnerMenu: document.querySelector("#rechner-menu-view"),
    rechner: document.querySelector("#rechner-view")
  };

  seeds = loadSeeds();
  renderSeedTable();
  renderVarietyOptions();
  toggleResult(false);

  if (seedForm) {
    seedForm.addEventListener("submit", handleSeedSubmit);
  }
  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", resetSeedForm);
  }
  if (calculatorForm) {
    calculatorForm.addEventListener("submit", handleCalculation);
  }

  navigationTargets.forEach((button) =>
    button.addEventListener("click", handleNavigationTarget)
  );
  backButtons.forEach((button) =>
    button.addEventListener("click", handleBackNavigation)
  );

  navigateTo("home", false);

  resetSeedForm();
}

function loadSeeds() {
  let stored = null;

  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Zugriff auf lokalen Speicher nicht möglich, verwende Standardsorten.", error);
  }

  if (!stored) {
    const seedCopy = cloneSeeds(defaultSeeds);
    saveSeeds(seedCopy);
    return seedCopy;
  }

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Konnte gespeicherte Sorten nicht lesen, verwende Standardwerte.", error);
  }

  const fallback = cloneSeeds(defaultSeeds);
  saveSeeds(fallback);
  return fallback;
}

function saveSeeds(list) {
  seeds = list;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
  } catch (error) {
    console.error("Konnte Sorten nicht im lokalen Speicher sichern.", error);
    alert(
      "Daten konnten nicht gespeichert werden. Bitte prüfen, ob der Browser das lokale Speichern erlaubt."
    );
  }
  renderSeedTable();
  renderVarietyOptions();
}

function handleSeedSubmit(event) {
  event.preventDefault();
  if (!seedForm) {
    return;
  }

  const seedData = {
    id: (seedIdField?.value || "").trim() || createId(),
    name: seedNameInput?.value.trim() ?? "",
    crop: seedCropInput?.value.trim() ?? "",
    germinationRate: Number.parseFloat(seedGerminationInput?.value ?? ""),
    thousandKernelWeight: Number.parseFloat(seedTkgInput?.value ?? ""),
    notes: seedNotesInput?.value.trim() ?? ""
  };

  if (!seedData.name || !seedData.crop || !isFinite(seedData.germinationRate) || !isFinite(seedData.thousandKernelWeight)) {
    alert("Bitte alle Pflichtfelder ausfüllen.");
    return;
  }

  if (seedData.germinationRate < 0 || seedData.germinationRate > 100) {
    alert("Keimfähigkeit muss zwischen 0 und 100 % liegen.");
    return;
  }

  if (seedData.thousandKernelWeight <= 0) {
    alert("TKG muss größer als 0 sein.");
    return;
  }

  const existingIndex = seeds.findIndex((seed) => seed.id === seedData.id);
  if (existingIndex >= 0) {
    const updated = [...seeds];
    updated[existingIndex] = seedData;
    saveSeeds(updated);
  } else {
    saveSeeds([...seeds, seedData]);
  }

  resetSeedForm();
}

function renderSeedTable() {
  if (!seedTableBody) {
    return;
  }

  seedTableBody.innerHTML = "";

  if (seeds.length === 0) {
    seedTableBody.insertAdjacentHTML(
      "beforeend",
      `<tr><td colspan="5">Noch keine Sorten angelegt.</td></tr>`
    );
    return;
  }

  for (const seed of seeds) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(seed.name)}</td>
      <td>${escapeHtml(seed.crop)}</td>
      <td>${formatNumber(seed.germinationRate, 1)}</td>
      <td>${formatNumber(seed.thousandKernelWeight, 1)}</td>
      <td>
        <div class="table-actions">
          <button type="button" data-action="edit" data-id="${seed.id}">Bearbeiten</button>
      <button type="button" data-action="delete" data-id="${seed.id}">Löschen</button>
        </div>
      </td>`;
    seedTableBody.appendChild(row);
  }

  seedTableBody.querySelectorAll("button[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "edit") {
      button.addEventListener("click", () => startEditingSeed(id));
    } else if (action === "delete") {
      button.addEventListener("click", () => deleteSeed(id));
    }
  });
}

function renderVarietyOptions() {
  if (!varietySelect) {
    return;
  }

  const currentValue = varietySelect.value;
  varietySelect.innerHTML = `<option value="">Bitte Sorte wählen</option>`;

  for (const seed of seeds) {
    const option = document.createElement("option");
    option.value = seed.id;
    option.textContent = `${seed.name} (${seed.crop})`;
    varietySelect.appendChild(option);
  }

  if (seeds.some((seed) => seed.id === currentValue)) {
    varietySelect.value = currentValue;
  }
}

function startEditingSeed(seedId) {
  const seed = seeds.find((item) => item.id === seedId);
  if (!seed) {
    return;
  }

  if (seedIdField) seedIdField.value = seed.id;
  if (seedNameInput) seedNameInput.value = seed.name;
  if (seedCropInput) {
    const hasOption = Array.from(seedCropInput.options || []).some((option) => option.value === seed.crop);
    seedCropInput.value = hasOption ? seed.crop : "";
  }
  if (seedGerminationInput) seedGerminationInput.value = seed.germinationRate;
  if (seedTkgInput) seedTkgInput.value = seed.thousandKernelWeight;
  if (seedNotesInput) seedNotesInput.value = seed.notes || "";

  const submitButton = seedForm?.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.textContent = "Aktualisieren";
  }
  cancelEditButton?.classList.remove("hidden");
}

function deleteSeed(seedId) {
  const seed = seeds.find((item) => item.id === seedId);
  if (!seed) {
    return;
  }

  const confirmed = window.confirm(`Sorte "${seed.name}" wirklich löschen?`);
  if (!confirmed) {
    return;
  }

  saveSeeds(seeds.filter((item) => item.id !== seedId));
  if (seedIdField && seedIdField.value === seedId) {
    resetSeedForm();
  }
}

function resetSeedForm() {
  if (!seedForm) {
    return;
  }

  seedForm.reset();
  if (seedIdField) seedIdField.value = "";
  const submitButton = seedForm.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.textContent = "Speichern";
  }
  cancelEditButton?.classList.add("hidden");
}

function handleCalculation(event) {
  event.preventDefault();

  const selectedId = varietySelect.value;
  const variety = seeds.find((seed) => seed.id === selectedId);

  if (!variety) {
    alert("Bitte eine Sorte auswählen.");
    return;
  }

  const targetDensity = Number.parseFloat(targetDensityInput?.value ?? "");
  const area = Number.parseFloat(areaInput?.value ?? "");
  const areaUnit = areaUnitSelect?.value ?? "hectare";

  if (!isFinite(targetDensity) || targetDensity <= 0) {
    alert("Bestandesdichte muss größer als 0 sein.");
    return;
  }

  if (!isFinite(area) || area <= 0) {
    alert("Fläche muss größer als 0 sein.");
    return;
  }

  const areaInSquareMeters = convertAreaToSquareMeters(area, areaUnit);
  const areaInHectares = areaInSquareMeters / 10_000;
  const seedsPerSquareMeter = targetDensity / (variety.germinationRate / 100);
  const seedsPerHectare = seedsPerSquareMeter * 10_000;
  const kgPerHectare = seedsPerSquareMeter * variety.thousandKernelWeight / 100;
  const totalKg = kgPerHectare * areaInHectares;

  resultSeedsPerM2.textContent = `${formatNumber(seedsPerSquareMeter, 1)} Körner`;
  resultSeedsPerHa.textContent = `${formatNumber(seedsPerHectare, 0)} Körner`;
  resultKgPerHa.textContent = `${formatNumber(kgPerHectare, 1)} kg`;
  resultTotalKg.textContent = `${formatNumber(totalKg, 2)} kg (${formatNumber(area, 2)} ${translateAreaUnit(areaUnit)})`;

  toggleResult(true);
}

function convertAreaToSquareMeters(value, unit) {
  switch (unit) {
    case "hectare":
      return value * 10_000;
    case "acre":
      return value * 4_046.8564224;
    case "squareMeter":
    default:
      return value;
  }
}

function translateAreaUnit(unit) {
  switch (unit) {
    case "hectare":
      return "ha";
    case "acre":
      return "ac";
    case "squareMeter":
      return "m²";
    default:
      return unit;
  }
}

function toggleResult(shouldShow) {
  if (!resultSection) {
    return;
  }

  resultSection.classList.toggle("hidden", !shouldShow);
}

function formatNumber(value, decimals = 2) {
  return Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `seed-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneSeeds(list) {
  if (typeof structuredClone === "function") {
    return structuredClone(list);
  }

  return JSON.parse(JSON.stringify(list));
}

function handleNavigationTarget(event) {
  const targetView = event.currentTarget?.dataset?.target;
  if (!targetView) {
    return;
  }

  navigateTo(targetView);
}

function handleBackNavigation() {
  if (viewHistory.length === 0) {
    navigateTo("home", false);
    return;
  }

  const previousView = viewHistory.pop();
  navigateTo(previousView, false);
}

function navigateTo(view, shouldPushHistory = true) {
  if (!viewSections?.[view]) {
    console.warn(`Unbekannte Ansicht: ${view}`);
    return;
  }

  if (currentView === view) {
    return;
  }

  if (shouldPushHistory && currentView) {
    viewHistory.push(currentView);
  } else if (!shouldPushHistory && view === "home") {
    viewHistory = [];
  }

  Object.entries(viewSections).forEach(([key, section]) => {
    if (!section) {
      return;
    }

    const isActive = key === view;
    section.classList.toggle("hidden", !isActive);
    section.setAttribute("aria-hidden", (!isActive).toString());
  });

  currentView = view;

  if (view === "home") {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((error) => console.error("Service Worker Registrierung fehlgeschlagen:", error));
  });
}
