const STORAGE_KEY = "farmApp.seedVarieties";
const PSM_STORAGE_KEY = "farmApp.plantProtection";
const CALCULATOR_STATE_KEY = "farmApp.seedCalculatorState";
const SPRAYER_TANK_VOLUME_LITERS = 4700;

const defaultSeeds = [
  {
    id: createId(),
    name: "Winterweizen KWS Example",
    crop: "Winterweizen",
    germinationRate: 94,
    thousandKernelWeight: 45,
    notes: "Standard-Sorte, mittlere Aussaat",
    recommendedTargetDensities: {
      early: 340,
      mid: 320,
      late: 300
    }
  },
  {
    id: createId(),
    name: "Wintergerste Sunshine",
    crop: "Wintergerste",
    germinationRate: 97,
    thousandKernelWeight: 38,
    notes: "Frühe Aussaat empfohlen",
    recommendedTargetDensities: {
      early: 320,
      mid: 300,
      late: 280
    }
  },
  {
    id: createId(),
    name: "Raps Hybrid RZ-500",
    crop: "Winterraps",
    germinationRate: 92,
    thousandKernelWeight: 5.2,
    notes: "Spätere Aussaat, gute Winterhärte",
    recommendedTargetDensities: {
      early: 60,
      mid: 50,
      late: 45
    }
  }
];

const defaultPlantProtection = [
  {
    id: createId(),
    name: "Carax",
    applications: [
      {
        id: createId(),
        crop: "Winterraps",
        maxAmount: 0.7,
        unit: "l"
      }
    ]
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
let seedTargetEarlyInput;
let seedTargetMidInput;
let seedTargetLateInput;
let targetDensityInput;
let sowingTimeSelect;
let fieldEmergenceSelect;
let filledAmountInput;
let currentAreaInput;
let recommendedDensityHint;
let resultSection;
let resultSeedsPerM2;
let resultSeedsPerHa;
let resultKgPerHa;
let resultTheoreticalArea;
let resultUpdatedArea;
let calculatorState = null;
let navigationTargets = [];
let backButtons = [];
let viewSections = {};
let viewHistory = [];
let currentView = null;
let plantProtectionItems = [];
let psmForm;
let psmCancelEditButton;
let psmTableBody;
let psmIdField;
let psmNameInput;
let psmApplicationList;
let addPsmApplicationButton;
let psmApplicationTemplate;
let psmCalculatorForm;
let psmCalculatorAreaInput;
let psmCalculatorRowsContainer;
let psmCalculatorAddRowButton;
let psmCalculatorRowTemplate;
let psmCalculatorResultSection;
let psmCalculatorResultBody;
let psmCalculatorWaterOutput;
let psmCalculatorEmptyHint;

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
  seedTargetEarlyInput = document.querySelector("#seed-target-early");
  seedTargetMidInput = document.querySelector("#seed-target-mid");
  seedTargetLateInput = document.querySelector("#seed-target-late");
  targetDensityInput = document.querySelector("#target-density");
  sowingTimeSelect = document.querySelector("#sowing-time");
  fieldEmergenceSelect = document.querySelector("#field-emergence");
  filledAmountInput = document.querySelector("#filled-amount");
  currentAreaInput = document.querySelector("#current-area");
  recommendedDensityHint = document.querySelector("#recommended-density");
  if (targetDensityInput && !targetDensityInput.dataset.autofilled) {
    targetDensityInput.dataset.autofilled = "true";
  }
  resultSection = document.querySelector("#result-section");
  resultSeedsPerM2 = document.querySelector("#result-seeds-per-m2");
  resultSeedsPerHa = document.querySelector("#result-seeds-per-ha");
  resultKgPerHa = document.querySelector("#result-kg-per-ha");
  resultTheoreticalArea = document.querySelector("#result-theoretical-area");
  resultUpdatedArea = document.querySelector("#result-updated-area");
  psmForm = document.querySelector("#psm-form");
  psmCancelEditButton = document.querySelector("#psm-cancel-edit");
  psmTableBody = document.querySelector("#psm-table-body");
  psmIdField = document.querySelector("#psm-id");
  psmNameInput = document.querySelector("#psm-name");
  psmApplicationList = document.querySelector("#psm-application-list");
  addPsmApplicationButton = document.querySelector("#add-psm-application");
  psmApplicationTemplate = document.querySelector("#psm-application-template");
  psmCalculatorForm = document.querySelector("#psm-calculator-form");
  psmCalculatorAreaInput = document.querySelector("#psm-coverage-area");
  psmCalculatorRowsContainer = document.querySelector("#psm-calculator-rows");
  psmCalculatorAddRowButton = document.querySelector("#psm-calculator-add-row");
  psmCalculatorRowTemplate = document.querySelector("#psm-calculator-row-template");
  psmCalculatorResultSection = document.querySelector("#psm-calculator-result");
  psmCalculatorResultBody = document.querySelector("#psm-calculator-result-body");
  psmCalculatorWaterOutput = document.querySelector("#psm-calculator-water");
  psmCalculatorEmptyHint = document.querySelector("#psm-calculator-empty-hint");
  navigationTargets = Array.from(document.querySelectorAll("[data-target]"));
  backButtons = Array.from(document.querySelectorAll("[data-action='back']"));
  viewSections = {
    home: document.querySelector("#home-view"),
    lagerMenu: document.querySelector("#lager-menu-view"),
    lager: document.querySelector("#lager-view"),
    rechnerMenu: document.querySelector("#rechner-menu-view"),
    rechner: document.querySelector("#rechner-view"),
    psmLager: document.querySelector("#psm-lager-view"),
    psmRechner: document.querySelector("#psm-rechner-view")
  };

  seeds = loadSeeds();
  plantProtectionItems = loadPlantProtectionItems();
  calculatorState = loadCalculatorState();

  renderSeedTable();
  renderVarietyOptions();
  renderPlantProtectionTable();
  refreshPsmCalculatorRows();
  applyCalculatorState(calculatorState);
  updateCalculatorStateFromInputs(false);
  toggleResult(false);

  if (seedForm) {
    seedForm.addEventListener("submit", handleSeedSubmit);
  }
  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", resetSeedForm);
  }
  if (psmForm) {
    psmForm.addEventListener("submit", handlePlantProtectionSubmit);
  }
  if (psmCancelEditButton) {
    psmCancelEditButton.addEventListener("click", resetPlantProtectionForm);
  }
  if (addPsmApplicationButton) {
    addPsmApplicationButton.addEventListener("click", () => addPlantProtectionApplicationRow());
  }
  if (calculatorForm) {
    calculatorForm.addEventListener("submit", handleCalculation);
  }
  if (psmCalculatorForm) {
    psmCalculatorForm.addEventListener("submit", handlePsmCalculatorSubmit);
  }
  if (psmCalculatorAddRowButton) {
    psmCalculatorAddRowButton.addEventListener("click", () => {
      addPsmCalculatorRow();
      clearPsmCalculatorResults();
    });
  }
  if (psmCalculatorAreaInput) {
    psmCalculatorAreaInput.addEventListener("input", clearPsmCalculatorResults);
  }
  if (varietySelect) {
    varietySelect.addEventListener("change", () => {
      updateSowingRecommendation(true);
      updateCalculatorStateFromInputs();
      toggleResult(false);
    });
  }
  if (sowingTimeSelect) {
    sowingTimeSelect.addEventListener("change", () => {
      updateSowingRecommendation(true);
      updateCalculatorStateFromInputs();
      toggleResult(false);
    });
  }
  if (fieldEmergenceSelect) {
    fieldEmergenceSelect.addEventListener("change", () => {
      updateCalculatorStateFromInputs();
      toggleResult(false);
    });
  }
  if (filledAmountInput) {
    filledAmountInput.addEventListener("input", () => {
      updateCalculatorStateFromInputs();
      toggleResult(false);
    });
  }
  if (currentAreaInput) {
    currentAreaInput.addEventListener("input", () => {
      updateCalculatorStateFromInputs();
      toggleResult(false);
    });
  }
  if (targetDensityInput) {
    targetDensityInput.addEventListener("input", () => {
      targetDensityInput.dataset.autofilled = "false";
      updateCalculatorStateFromInputs();
      toggleResult(false);
    });
  }

  ensurePsmCalculatorRow();
  refreshPsmCalculatorRows();
  updatePsmCalculatorControls();
  clearPsmCalculatorResults();

  navigationTargets.forEach((button) =>
    button.addEventListener("click", handleNavigationTarget)
  );
  backButtons.forEach((button) =>
    button.addEventListener("click", handleBackNavigation)
  );

  navigateTo("home", false);

  resetSeedForm();
  resetPlantProtectionForm();
}

function loadSeeds() {
  let stored = null;

  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Zugriff auf lokalen Speicher nicht möglich, verwende Standardsorten.", error);
  }

  if (!stored) {
    const defaults = normalizeSeedList(defaultSeeds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch (error) {
      console.warn("Konnte Standardsorten nicht speichern.", error);
    }
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      const normalized = normalizeSeedList(parsed);
      if (normalized.length > 0) {
        return normalized;
      }
    }
  } catch (error) {
    console.warn("Konnte gespeicherte Sorten nicht lesen, verwende Standardwerte.", error);
  }

  const fallback = normalizeSeedList(defaultSeeds);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
  } catch (error) {
    console.warn("Konnte Standardsorten nicht speichern.", error);
  }
  return fallback;
}

function saveSeeds(list) {
  const normalized = normalizeSeedList(list);
  seeds = normalized;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Konnte Sorten nicht im lokalen Speicher sichern.", error);
    alert("Daten konnten nicht gespeichert werden. Bitte prüfen, ob der Browser das lokale Speichern erlaubt.");
  }
  renderSeedTable();
  renderVarietyOptions();
  updateSowingRecommendation();
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
    notes: seedNotesInput?.value.trim() ?? "",
    recommendedTargetDensities: {
      early: parsePositiveNumberOrNull(seedTargetEarlyInput?.value),
      mid: parsePositiveNumberOrNull(seedTargetMidInput?.value),
      late: parsePositiveNumberOrNull(seedTargetLateInput?.value)
    }
  };

  if (
    !seedData.name ||
    !seedData.crop ||
    !Number.isFinite(seedData.germinationRate) ||
    !Number.isFinite(seedData.thousandKernelWeight)
  ) {
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
      `<tr><td colspan="6">Noch keine Sorten angelegt.</td></tr>`
    );
    return;
  }

  for (const seed of seeds) {
    const row = document.createElement("tr");
    const targetSummary = formatTargetDensitySummary(seed.recommendedTargetDensities);
    row.innerHTML = `
      <td>${escapeHtml(seed.name)}</td>
      <td>${escapeHtml(seed.crop)}</td>
      <td>${formatNumber(seed.germinationRate, 1)}</td>
      <td>${formatNumber(seed.thousandKernelWeight, 1)}</td>
      <td class="seed-target-cell">${targetSummary}</td>
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

  const preferredValue =
    calculatorState?.varietyId && seeds.some((seed) => seed.id === calculatorState.varietyId)
      ? calculatorState.varietyId
      : varietySelect.value;

  varietySelect.innerHTML = `<option value="">Bitte Sorte wählen</option>`;

  for (const seed of seeds) {
    const option = document.createElement("option");
    option.value = seed.id;
    option.textContent = `${seed.name} (${seed.crop})`;
    varietySelect.appendChild(option);
  }

  if (preferredValue && seeds.some((seed) => seed.id === preferredValue)) {
    varietySelect.value = preferredValue;
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
  const recommended = seed.recommendedTargetDensities ?? {};
  if (seedTargetEarlyInput) {
    seedTargetEarlyInput.value = Number.isFinite(recommended.early) ? recommended.early : "";
  }
  if (seedTargetMidInput) {
    seedTargetMidInput.value = Number.isFinite(recommended.mid) ? recommended.mid : "";
  }
  if (seedTargetLateInput) {
    seedTargetLateInput.value = Number.isFinite(recommended.late) ? recommended.late : "";
  }

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

function loadPlantProtectionItems() {
  let stored = null;

  try {
    stored = localStorage.getItem(PSM_STORAGE_KEY);
  } catch (error) {
    console.warn("Zugriff auf lokalen Speicher nicht möglich, verwende Standardmittel.", error);
  }

  if (!stored) {
    const defaults = cloneSeeds(defaultPlantProtection);
    savePlantProtectionItems(defaults);
    return plantProtectionItems;
  }

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      const normalized = normalizePlantProtectionList(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        savePlantProtectionItems(normalized);
        return plantProtectionItems;
      }
      return normalized;
    }
  } catch (error) {
    console.warn("Konnte gespeicherte Pflanzenschutzmittel nicht lesen, verwende Standardwerte.", error);
  }

  const fallback = cloneSeeds(defaultPlantProtection);
  savePlantProtectionItems(fallback);
  return plantProtectionItems;
}

function savePlantProtectionItems(list) {
  const normalized = normalizePlantProtectionList(list);
  plantProtectionItems = normalized;
  try {
    localStorage.setItem(PSM_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Konnte Pflanzenschutzmittel nicht im lokalen Speicher sichern.", error);
    alert("Daten konnten nicht gespeichert werden. Bitte prüfen, ob der Browser das lokale Speichern erlaubt.");
  }
  renderPlantProtectionTable();
}

function handlePlantProtectionSubmit(event) {
  event.preventDefault();
  if (!psmForm) {
    return;
  }

  const id = (psmIdField?.value || "").trim() || createId();
  const name = psmNameInput?.value.trim() ?? "";
  const applications = collectPlantProtectionApplications();

  if (!name) {
    alert("Bitte einen Mittelnamen angeben.");
    return;
  }

  if (applications.length === 0) {
    alert("Bitte mindestens eine Verwendung hinzuzufügen.");
    return;
  }

  const hasInvalidApplication = applications.some(
    (application) =>
      !application.crop || !Number.isFinite(application.maxAmount) || application.maxAmount <= 0 || !application.unit
  );
  if (hasInvalidApplication) {
    alert("Bitte alle Verwendungen komplett und gültig ausfüllen (Kultur, Menge, Einheit).");
    return;
  }

  const item = { id, name, applications };

  const existingIndex = plantProtectionItems.findIndex((entry) => entry.id === item.id);
  if (existingIndex >= 0) {
    const updated = [...plantProtectionItems];
    updated[existingIndex] = item;
    savePlantProtectionItems(updated);
  } else {
    savePlantProtectionItems([...plantProtectionItems, item]);
  }

  resetPlantProtectionForm();
}

function renderPlantProtectionTable() {
  if (!psmTableBody) {
    return;
  }

  psmTableBody.innerHTML = "";

  if (plantProtectionItems.length === 0) {
    psmTableBody.insertAdjacentHTML(
      "beforeend",
      `<tr><td colspan="3">Noch keine Pflanzenschutzmittel angelegt.</td></tr>`
    );
    return;
  }

  for (const item of plantProtectionItems) {
    const applicationEntries = (item.applications ?? [])
      .map((application) => formatPlantProtectionApplication(application))
      .join("") || `<span class="psm-application-entry">Keine Angaben</span>`;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${applicationEntries}</td>
      <td>
        <div class="table-actions">
          <button type="button" data-action="edit-psm" data-id="${item.id}">Bearbeiten</button>
          <button type="button" data-action="delete-psm" data-id="${item.id}">Löschen</button>
        </div>
      </td>`;
    psmTableBody.appendChild(row);
  }

  psmTableBody.querySelectorAll("button[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "edit-psm") {
      button.addEventListener("click", () => startEditingPlantProtection(id));
    } else if (action === "delete-psm") {
      button.addEventListener("click", () => deletePlantProtection(id));
    }
  });
}

function startEditingPlantProtection(itemId) {
  const item = plantProtectionItems.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  if (psmIdField) psmIdField.value = item.id;
  if (psmNameInput) psmNameInput.value = item.name;

  populatePlantProtectionApplications(item.applications);

  const submitButton = psmForm?.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.textContent = "Aktualisieren";
  }
  psmCancelEditButton?.classList.remove("hidden");
}

function deletePlantProtection(itemId) {
  const item = plantProtectionItems.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  const confirmed = window.confirm(`Mittel "${item.name}" wirklich löschen?`);
  if (!confirmed) {
    return;
  }

  savePlantProtectionItems(plantProtectionItems.filter((entry) => entry.id !== itemId));
  if (psmIdField && psmIdField.value === itemId) {
    resetPlantProtectionForm();
  }
}

function resetPlantProtectionForm() {
  if (!psmForm) {
    return;
  }

  psmForm.reset();
  if (psmIdField) psmIdField.value = "";
  if (psmNameInput) psmNameInput.value = "";

  clearPlantProtectionApplications();
  ensurePlantProtectionApplicationRow();

  const submitButton = psmForm.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.textContent = "Speichern";
  }
  psmCancelEditButton?.classList.add("hidden");
}

function clearPlantProtectionApplications() {
  if (psmApplicationList) {
    psmApplicationList.innerHTML = "";
  }
}

function ensurePlantProtectionApplicationRow() {
  if (!psmApplicationList) {
    return;
  }

  if (psmApplicationList.querySelectorAll(".psm-application-row").length === 0) {
    addPlantProtectionApplicationRow();
  }
}

function populatePlantProtectionApplications(applications = []) {
  clearPlantProtectionApplications();

  if (!Array.isArray(applications) || applications.length === 0) {
    ensurePlantProtectionApplicationRow();
    return;
  }

  applications.forEach((application) => addPlantProtectionApplicationRow(application));
}

function addPlantProtectionApplicationRow(values = {}) {
  if (!psmApplicationList) {
    return null;
  }

  let row = psmApplicationTemplate?.content?.firstElementChild?.cloneNode(true) ?? null;

  if (!row) {
    row = document.createElement("div");
    row.className = "psm-application-row";
    row.innerHTML = `
      <select class="psm-application-crop" required>
        <option value="">Bitte Kultur wählen</option>
        <option value="Winterweizen">Winterweizen</option>
        <option value="Sommerdurum">Sommerdurum</option>
        <option value="Winterraps">Winterraps</option>
        <option value="Wintergerste">Wintergerste</option>
        <option value="Mais">Mais</option>
        <option value="Zuckerrüben">Zuckerrüben</option>
        <option value="Erbsen">Erbsen</option>
        <option value="Sojabohnen">Sojabohnen</option>
      </select>
      <div class="psm-amount-input">
        <input type="number" class="psm-application-amount" min="0" step="0.01" placeholder="z. B. 0,7" required />
        <select class="psm-application-unit">
          <option value="l">l</option>
          <option value="g">g</option>
        </select>
      </div>
      <button type="button" class="icon-button" data-action="remove-psm-application" aria-label="Verwendung entfernen">&times;</button>
    `;
  }

  const applicationId =
    typeof values.id === "string" && values.id.trim() ? values.id.trim() : createId();
  row.dataset.applicationId = applicationId;

  const cropSelect = row.querySelector(".psm-application-crop");
  if (cropSelect) {
    const cropValue = typeof values.crop === "string" ? values.crop.trim() : "";
    if (cropValue) {
      const hasOption = Array.from(cropSelect.options).some((option) => option.value === cropValue);
      if (!hasOption) {
        const customOption = document.createElement("option");
        customOption.value = cropValue;
        customOption.textContent = cropValue;
        cropSelect.appendChild(customOption);
      }
      cropSelect.value = cropValue;
    } else {
      cropSelect.value = "";
    }
  }

  const amountInput = row.querySelector(".psm-application-amount");
  if (amountInput) {
    if (typeof values.maxAmount === "number" && !Number.isNaN(values.maxAmount)) {
      amountInput.value = values.maxAmount;
    } else if (typeof values.maxAmount === "string") {
      amountInput.value = values.maxAmount;
    } else {
      amountInput.value = "";
    }
  }

  const unitSelect = row.querySelector(".psm-application-unit");
  if (unitSelect) {
    unitSelect.value = typeof values.unit === "string" && values.unit.trim() ? values.unit : "l";
  }

  const removeButton = row.querySelector("[data-action='remove-psm-application']");
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      row.remove();
      ensurePlantProtectionApplicationRow();
    });
  }

  psmApplicationList.appendChild(row);
  return row;
}

function collectPlantProtectionApplications() {
  if (!psmApplicationList) {
    return [];
  }

  return Array.from(psmApplicationList.querySelectorAll(".psm-application-row")).map((row) => {
    const crop = row.querySelector(".psm-application-crop")?.value.trim() ?? "";
    const amountValue = row.querySelector(".psm-application-amount")?.value ?? "";
    const unit = row.querySelector(".psm-application-unit")?.value ?? "l";
    const normalizedAmountValue = amountValue.replace(",", ".");
    const maxAmount = Number.parseFloat(normalizedAmountValue);
    const applicationId = row.dataset.applicationId || createId();
    row.dataset.applicationId = applicationId;

    return {
      id: applicationId,
      crop,
      maxAmount,
      unit
    };
  });
}

function formatPlantProtectionApplication(application) {
  if (!application) {
    return "";
  }

  const decimals = Number.isInteger(application.maxAmount) ? 0 : 2;
  const amountText = formatNumber(application.maxAmount, decimals);
  return `<div class="psm-application-entry"><span class="psm-application-entry__crop">${escapeHtml(
    application.crop
  )}</span>: ${amountText} ${escapeHtml(application.unit ?? "")}</div>`;
}

function normalizePlantProtectionList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  const items = [];

  for (const entry of list) {
    const normalized = normalizePlantProtectionItem(entry);
    if (normalized) {
      items.push(normalized);
    }
  }

  return items;
}

function normalizePlantProtectionItem(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const id = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : createId();
  const name = typeof entry.name === "string" ? entry.name.trim() : "";

  const rawApplications = Array.isArray(entry.applications)
    ? entry.applications
    : entry.crop
    ? [
        {
          id: entry.applicationId ?? entry.id ?? createId(),
          crop: entry.crop,
          maxAmount: entry.maxAmount,
          unit: entry.unit
        }
      ]
    : [];

  const applications = rawApplications
    .map(normalizePlantProtectionApplication)
    .filter(Boolean);

  if (!name || applications.length === 0) {
    return null;
  }

  return {
    id,
    name,
    applications
  };
}

function normalizePlantProtectionApplication(application) {
  if (!application || typeof application !== "object") {
    return null;
  }

  const crop = typeof application.crop === "string" ? application.crop.trim() : "";
  const unit =
    typeof application.unit === "string" && application.unit.trim() ? application.unit.trim() : "l";
  const rawAmount = typeof application.maxAmount === "string" ? application.maxAmount.replace(",", ".") : application.maxAmount;
  const maxAmount = Number.parseFloat(rawAmount);

  if (!crop || !Number.isFinite(maxAmount) || maxAmount <= 0) {
    return null;
  }

  return {
    id: typeof application.id === "string" && application.id.trim() ? application.id.trim() : createId(),
    crop,
    maxAmount,
    unit
  };
}

function ensurePsmCalculatorRow() {
  if (!psmCalculatorRowsContainer) {
    return;
  }

  if (psmCalculatorRowsContainer.querySelectorAll(".psm-calculator-row").length === 0) {
    addPsmCalculatorRow();
  }
}

function addPsmCalculatorRow(values = {}) {
  if (!psmCalculatorRowsContainer) {
    return null;
  }

  let row = psmCalculatorRowTemplate?.content?.firstElementChild?.cloneNode(true) ?? null;

  if (!row) {
    row = document.createElement("div");
    row.className = "psm-calculator-row";
    row.innerHTML = `
      <select class="psm-calculator-product" required aria-label="Pflanzenschutzmittel ausw\u00e4hlen"></select>
      <select class="psm-calculator-application" required aria-label="Anwendungsvariante" disabled></select>
      <div class="psm-amount-input psm-calculator-rate-group">
        <input
          type="number"
          class="psm-calculator-rate"
          min="0"
          step="0.01"
          placeholder="Aufwandmenge je ha"
          required
          aria-label="Aufwandmenge je ha"
          disabled
        />
        <div class="psm-calculator-rate-actions">
          <button type="button" class="link-button" data-action="use-max-rate">Max \u00fcbernehmen</button>
        </div>
      </div>
      <button type="button" class="icon-button" data-action="remove-psm-calculator-row" aria-label="Zeile entfernen">&times;</button>
    `;
  }

  const productSelect = row.querySelector(".psm-calculator-product");
  const applicationSelect = row.querySelector(".psm-calculator-application");
  const rateInput = row.querySelector(".psm-calculator-rate");
  const useMaxButton = row.querySelector("[data-action='use-max-rate']");
  const removeButton = row.querySelector("[data-action='remove-psm-calculator-row']");

  if (productSelect) {
    productSelect.addEventListener("change", () => {
      handlePsmCalculatorProductChange(row, productSelect.value);
      clearPsmCalculatorResults();
    });
  }

  if (applicationSelect) {
    applicationSelect.addEventListener("change", () => {
      handlePsmCalculatorApplicationChange(row, applicationSelect.value);
      clearPsmCalculatorResults();
    });
  }

  if (rateInput) {
    rateInput.addEventListener("input", () => {
      const maxAmount = Number.parseFloat(rateInput.dataset.maxAmount ?? "");
      const currentValue = Number.parseFloat(rateInput.value);
      if (Number.isFinite(maxAmount) && Number.isFinite(currentValue) && currentValue > maxAmount) {
        rateInput.value = maxAmount;
      }
      clearPsmCalculatorResults();
    });
  }

  if (useMaxButton && rateInput) {
    useMaxButton.addEventListener("click", () => {
      const option = applicationSelect?.selectedOptions?.[0];
      const maxAmount = Number.parseFloat(option?.dataset?.maxAmount ?? "");
      if (Number.isFinite(maxAmount)) {
        rateInput.value = maxAmount;
        clearPsmCalculatorResults();
      }
    });
  }

  if (removeButton) {
    removeButton.addEventListener("click", () => {
      row.remove();
      ensurePsmCalculatorRow();
      updatePsmCalculatorControls();
      clearPsmCalculatorResults();
    });
  }

  populatePsmCalculatorProductOptions(productSelect, values.productId ?? "");
  handlePsmCalculatorProductChange(
    row,
    productSelect?.value ?? "",
    values.applicationId ?? "",
    values.rate ?? ""
  );

  psmCalculatorRowsContainer.appendChild(row);
  updatePsmCalculatorControls();
  return row;
}

function populatePsmCalculatorProductOptions(selectElement, selectedValue = "") {
  if (!selectElement) {
    return;
  }

  selectElement.innerHTML = "";

  if (!Array.isArray(plantProtectionItems) || plantProtectionItems.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Keine Mittel verf\u00fcgbar";
    option.disabled = true;
    option.selected = true;
    selectElement.appendChild(option);
    selectElement.disabled = true;
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Mittel w\u00e4hlen";
  placeholder.disabled = true;
  placeholder.selected = !selectedValue;
  selectElement.appendChild(placeholder);

  for (const item of plantProtectionItems) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    if (item.id === selectedValue) {
      option.selected = true;
      placeholder.selected = false;
    }
    selectElement.appendChild(option);
  }

  selectElement.disabled = false;

  if (selectedValue && !plantProtectionItems.some((item) => item.id === selectedValue)) {
    selectElement.value = "";
    placeholder.selected = true;
  }
}

function handlePsmCalculatorProductChange(row, productId, preferredApplicationId = "", rateValue = "") {
  const product = getPlantProtectionItemById(productId);
  const applicationSelect = row.querySelector(".psm-calculator-application");

  if (!applicationSelect) {
    return;
  }

  applicationSelect.innerHTML = "";

  if (!product || !Array.isArray(product.applications) || product.applications.length === 0) {
    applicationSelect.disabled = true;
    updatePsmCalculatorRateInput(row, null, "", "");
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Anwendung w\u00e4hlen";
  placeholder.disabled = true;
  applicationSelect.appendChild(placeholder);

  let selectedApplicationId = "";

  for (const application of product.applications) {
    const option = document.createElement("option");
    option.value = application.id;
    const decimals = Number.isInteger(application.maxAmount) ? 0 : 2;
    option.textContent = `${application.crop} (max. ${formatNumber(application.maxAmount, decimals)} ${application.unit})`;
    option.dataset.maxAmount = String(application.maxAmount);
    option.dataset.unit = application.unit;
    applicationSelect.appendChild(option);

    if (!selectedApplicationId) {
      selectedApplicationId = application.id;
    }
    if (application.id === preferredApplicationId) {
      selectedApplicationId = application.id;
    }
  }

  if (preferredApplicationId && !product.applications.some((app) => app.id === preferredApplicationId)) {
    selectedApplicationId = product.applications[0]?.id ?? "";
  }

  if (selectedApplicationId) {
    applicationSelect.value = selectedApplicationId;
    placeholder.selected = false;
  } else {
    applicationSelect.value = "";
    placeholder.selected = true;
  }

  applicationSelect.disabled = false;
  handlePsmCalculatorApplicationChange(row, applicationSelect.value, rateValue);
}

function handlePsmCalculatorApplicationChange(row, applicationId, rateValue = "") {
  const productSelect = row.querySelector(".psm-calculator-product");
  const product = getPlantProtectionItemById(productSelect?.value ?? "");
  updatePsmCalculatorRateInput(row, product, applicationId, rateValue);
}

function updatePsmCalculatorRateInput(row, product, applicationId, rateValue = "") {
  const rateInput = row.querySelector(".psm-calculator-rate");
  const useMaxButton = row.querySelector("[data-action='use-max-rate']");

  if (!rateInput) {
    return;
  }

  const application = product ? getPlantProtectionApplication(product, applicationId) : null;

  if (!application) {
    rateInput.value = "";
    rateInput.disabled = true;
    rateInput.placeholder = "Aufwandmenge je ha";
    rateInput.removeAttribute("max");
    rateInput.dataset.maxAmount = "";
    rateInput.dataset.unit = "";
    if (useMaxButton) {
      useMaxButton.disabled = true;
    }
    return;
  }

  const decimals = Number.isInteger(application.maxAmount) ? 0 : 2;
  rateInput.placeholder = `max. ${formatNumber(application.maxAmount, decimals)} ${application.unit}`;
  rateInput.setAttribute("max", application.maxAmount);
  rateInput.dataset.maxAmount = String(application.maxAmount);
  rateInput.dataset.unit = application.unit;
  rateInput.disabled = false;

  if (typeof rateValue === "string" && rateValue.trim()) {
    rateInput.value = rateValue;
  } else if (typeof rateValue === "number" && Number.isFinite(rateValue)) {
    rateInput.value = rateValue;
  } else if (rateInput.value) {
    const numericValue = Number.parseFloat(rateInput.value);
    if (!Number.isFinite(numericValue) || numericValue > application.maxAmount) {
      rateInput.value = "";
    }
  }

  if (useMaxButton) {
    useMaxButton.disabled = false;
  }
}

function refreshPsmCalculatorRows() {
  if (!psmCalculatorRowsContainer) {
    return;
  }

  const rows = Array.from(psmCalculatorRowsContainer.querySelectorAll(".psm-calculator-row"));

  if (rows.length === 0) {
    ensurePsmCalculatorRow();
    updatePsmCalculatorControls();
    return;
  }

  for (const row of rows) {
    const productSelect = row.querySelector(".psm-calculator-product");
    const applicationSelect = row.querySelector(".psm-calculator-application");
    const rateInput = row.querySelector(".psm-calculator-rate");

    const previousProductId = productSelect?.value ?? "";
    const previousApplicationId = applicationSelect?.value ?? "";
    const previousRateValue = rateInput?.value ?? "";

    populatePsmCalculatorProductOptions(productSelect, previousProductId);
    handlePsmCalculatorProductChange(
      row,
      productSelect?.value ?? "",
      previousApplicationId,
      previousRateValue
    );
  }

  updatePsmCalculatorControls();
  clearPsmCalculatorResults();
}

function updatePsmCalculatorControls() {
  const hasItems = Array.isArray(plantProtectionItems) && plantProtectionItems.length > 0;

  if (psmCalculatorAddRowButton) {
    psmCalculatorAddRowButton.disabled = !hasItems;
  }
  if (psmCalculatorEmptyHint) {
    psmCalculatorEmptyHint.classList.toggle("hidden", hasItems);
  }

  if (!psmCalculatorRowsContainer) {
    return;
  }

  psmCalculatorRowsContainer
    .querySelectorAll(".psm-calculator-product")
    .forEach((select) => {
      if (!hasItems) {
        select.disabled = true;
      }
    });
}

function collectPsmCalculatorRows() {
  if (!psmCalculatorRowsContainer) {
    return [];
  }

  const rows = Array.from(psmCalculatorRowsContainer.querySelectorAll(".psm-calculator-row"));
  const result = [];

  for (const row of rows) {
    const productSelect = row.querySelector(".psm-calculator-product");
    const applicationSelect = row.querySelector(".psm-calculator-application");
    const rateInput = row.querySelector(".psm-calculator-rate");

    const productId = productSelect?.value?.trim() ?? "";
    const applicationId = applicationSelect?.value?.trim() ?? "";
    const rawRateValue = (rateInput?.value ?? "").trim();
    const normalizedRateValue = rawRateValue.replace(",", ".");
    const rate = Number.parseFloat(normalizedRateValue);

    const product = getPlantProtectionItemById(productId);
    const application = product ? getPlantProtectionApplication(product, applicationId) : null;

    result.push({
      row,
      productId,
      product,
      applicationId,
      application,
      rate,
      rawRateValue,
      rateInput
    });
  }

  return result;
}

function getPlantProtectionItemById(productId) {
  if (!productId) {
    return null;
  }

  return plantProtectionItems.find((item) => item.id === productId) ?? null;
}

function getPlantProtectionApplication(product, applicationId) {
  if (!product || !applicationId) {
    return null;
  }

  return product.applications?.find((application) => application.id === applicationId) ?? null;
}

function handlePsmCalculatorSubmit(event) {
  event.preventDefault();
  clearPsmCalculatorResults();

  if (!psmCalculatorForm) {
    return;
  }

  const areaRaw = (psmCalculatorAreaInput?.value ?? "").toString().replace(",", ".");
  const area = Number.parseFloat(areaRaw);

  if (!Number.isFinite(area) || area <= 0) {
    alert("Bitte eine g\u00fcltige Fl\u00e4che je Tankf\u00fcllung angeben.");
    return;
  }

  const rows = collectPsmCalculatorRows();
  const activeRows = rows.filter((entry) => entry.productId);

  if (activeRows.length === 0) {
    alert("Bitte mindestens ein Pflanzenschutzmittel ausw\u00e4hlen.");
    return;
  }

  for (const entry of activeRows) {
    if (!entry.product) {
      alert("Ausgew\u00e4hltes Pflanzenschutzmittel ist nicht mehr vorhanden. Bitte Auswahl pr\u00fcfen.");
      return;
    }

    if (!entry.application) {
      alert(`F\u00fcr "${entry.product.name}" ist keine Anwendung hinterlegt. Bitte im Lager eine Verwendung anlegen.`);
      return;
    }

    if (!Number.isFinite(entry.rate) || entry.rate <= 0) {
      alert(`Bitte eine g\u00fcltige Aufwandmenge f\u00fcr "${entry.product.name}" eingeben.`);
      return;
    }

    if (entry.rate > entry.application.maxAmount + Number.EPSILON) {
      const decimals = Number.isInteger(entry.application.maxAmount) ? 0 : 2;
      alert(
        `Die Aufwandmenge f\u00fcr "${entry.product.name}" darf ${formatNumber(
          entry.application.maxAmount,
          decimals
        )} ${entry.application.unit} je ha nicht \u00fcberschreiten.`
      );
      return;
    }
  }

  if (!psmCalculatorResultBody || !psmCalculatorResultSection || !psmCalculatorWaterOutput) {
    return;
  }

  const results = activeRows.map((entry) => {
    const totalAmount = entry.rate * area;
    return {
      productName: entry.product?.name ?? "",
      crop: entry.application?.crop ?? "",
      unit: entry.application?.unit ?? "",
      rate: entry.rate,
      totalAmount
    };
  });

  psmCalculatorResultBody.innerHTML = "";

  results.forEach((item) => {
    const rateDecimals = Number.isInteger(item.rate) ? 0 : 2;
    const totalDecimals = Number.isInteger(item.totalAmount) ? 0 : 2;
    psmCalculatorResultBody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${escapeHtml(item.crop)}</td>
          <td>${formatNumber(item.rate, rateDecimals)} ${escapeHtml(item.unit)}</td>
          <td>${formatNumber(item.totalAmount, totalDecimals)} ${escapeHtml(item.unit)}</td>
        </tr>
      `
    );
  });

  const waterPerHectare = SPRAYER_TANK_VOLUME_LITERS / area;
  const waterDecimals = waterPerHectare < 10 ? 2 : 1;
  const tankVolumeText = formatNumber(SPRAYER_TANK_VOLUME_LITERS, 0);
  psmCalculatorWaterOutput.textContent = `Wasseraufwandmenge: ${formatNumber(
    waterPerHectare,
    waterDecimals
  )} l/ha (Tank: ${tankVolumeText} l)`;

  psmCalculatorResultSection.classList.remove("hidden");
}

function clearPsmCalculatorResults() {
  if (psmCalculatorResultBody) {
    psmCalculatorResultBody.innerHTML = "";
  }
  if (psmCalculatorWaterOutput) {
    psmCalculatorWaterOutput.textContent = "";
  }
  if (psmCalculatorResultSection) {
    psmCalculatorResultSection.classList.add("hidden");
  }
}

function handleCalculation(event) {
  event.preventDefault();

  const variety = getSelectedVariety();

  if (!variety) {
    alert("Bitte eine Sorte auswählen.");
    return;
  }

  const targetDensity = parsePositiveNumberOrNull(targetDensityInput?.value);
  if (targetDensity === null) {
    alert("Ziel-Bestandesdichte muss größer als 0 sein.");
    return;
  }

  const fieldEmergence = parseNumberOrNull(fieldEmergenceSelect?.value) ?? 0.9;
  if (!Number.isFinite(fieldEmergence) || fieldEmergence <= 0 || fieldEmergence > 1) {
    alert("Bitte einen gültigen Feldaufgang auswählen.");
    return;
  }

  const filledAmount = parsePositiveNumberOrNull(filledAmountInput?.value);
  if (filledAmount === null) {
    alert("Bitte eine gültige eingefüllte Menge angeben.");
    return;
  }

  let currentArea = 0;
  const currentAreaRaw = currentAreaInput?.value ?? "";
  if (currentAreaRaw.trim() !== "") {
    const parsedCurrent = Number.parseFloat(currentAreaRaw.replace(",", "."));
    if (!Number.isFinite(parsedCurrent) || parsedCurrent < 0) {
      alert("Aktuelle Fläche darf nicht negativ sein.");
      return;
    }
    currentArea = parsedCurrent;
  }

  const germinationFactor = variety.germinationRate / 100;
  if (germinationFactor <= 0) {
    alert("Keimfähigkeit der Sorte ist ungültig.");
    return;
  }

  const effectiveFactor = germinationFactor * fieldEmergence;
  if (effectiveFactor <= 0) {
    alert("Feldaufgang und Keimfähigkeit ergeben keinen gültigen Faktor.");
    return;
  }

  const seedsPerSquareMeter = targetDensity / effectiveFactor;
  const seedsPerHectare = seedsPerSquareMeter * 10_000;
  const kgPerHectare = (seedsPerSquareMeter * variety.thousandKernelWeight) / 100;
  const theoreticalArea = kgPerHectare > 0 ? filledAmount / kgPerHectare : 0;
  const updatedArea = currentArea + theoreticalArea;

  if (resultSeedsPerM2) {
    resultSeedsPerM2.textContent = `${formatNumber(seedsPerSquareMeter, 1)} Körner`;
  }
  if (resultSeedsPerHa) {
    resultSeedsPerHa.textContent = `${formatNumber(seedsPerHectare, 0)} Körner`;
  }
  if (resultKgPerHa) {
    resultKgPerHa.textContent = `${formatNumber(kgPerHectare, 1)} kg`;
  }
  if (resultTheoreticalArea) {
    resultTheoreticalArea.textContent = `${formatNumber(theoreticalArea, 2)} ha`;
  }
  if (resultUpdatedArea) {
    resultUpdatedArea.textContent = `${formatNumber(updatedArea, 2)} ha`;
  }

  toggleResult(true);

  if (currentAreaInput) {
    currentAreaInput.value = formatNumberForInput(updatedArea, 2);
  }

  updateCalculatorStateFromInputs();
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

function normalizeSeedList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  const normalized = [];

  for (const entry of list) {
    const seed = normalizeSeedItem(entry);
    if (seed) {
      normalized.push(seed);
    }
  }

  return normalized;
}

function normalizeSeedItem(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const id = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : createId();
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const crop = typeof entry.crop === "string" ? entry.crop.trim() : "";
  const germinationRateRaw = toNumber(entry.germinationRate);
  const germinationRate = Number.isFinite(germinationRateRaw) ? clamp(germinationRateRaw, 0, 100) : null;
  const tkgRaw = toNumber(entry.thousandKernelWeight);
  const thousandKernelWeight = Number.isFinite(tkgRaw) && tkgRaw > 0 ? tkgRaw : null;

  if (!name || !crop || germinationRate === null || thousandKernelWeight === null) {
    return null;
  }

  const recommended = entry.recommendedTargetDensities ?? {};

  return {
    id,
    name,
    crop,
    germinationRate,
    thousandKernelWeight,
    notes: typeof entry.notes === "string" ? entry.notes.trim() : "",
    recommendedTargetDensities: {
      early: parsePositiveNumberOrNull(recommended.early),
      mid: parsePositiveNumberOrNull(recommended.mid),
      late: parsePositiveNumberOrNull(recommended.late)
    }
  };
}

function parsePositiveNumberOrNull(value) {
  const numeric = toNumber(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function parseNonNegativeNumberOrNull(value) {
  const numeric = toNumber(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function parseNumberOrNull(value) {
  const numeric = toNumber(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) {
      return Number.NaN;
    }
    return Number.parseFloat(normalized);
  }
  return Number.NaN;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatNumberForInput(value, decimals = null) {
  if (!Number.isFinite(value)) {
    return "";
  }
  if (decimals === null) {
    return String(value);
  }
  const fixed = Number(value).toFixed(decimals);
  if (decimals === 0) {
    return fixed;
  }
  return Number.parseFloat(fixed).toString();
}

function formatTargetDensitySummary(densities) {
  const entries = [
    { key: "early", label: "Früh" },
    { key: "mid", label: "Mittel" },
    { key: "late", label: "Spät" }
  ];

  if (!densities) {
    return `<div class="seed-target-summary"><span>–</span></div>`;
  }

  const parts = entries.map(({ key, label }) => {
    const value = densities[key];
    if (Number.isFinite(value) && value > 0) {
      return `<span>${escapeHtml(label)}: ${formatNumber(value, 0)}</span>`;
    }
    return `<span>${escapeHtml(label)}: –</span>`;
  });

  return `<div class="seed-target-summary">${parts.join("")}</div>`;
}

function getSelectedVariety() {
  const selectedId = varietySelect?.value;
  if (!selectedId) {
    return null;
  }
  return seeds.find((seed) => seed.id === selectedId) ?? null;
}

function getRecommendedTargetDensity(variety, sowingTime) {
  if (!variety?.recommendedTargetDensities) {
    return null;
  }

  const key = ["early", "mid", "late"].includes(sowingTime) ? sowingTime : "mid";
  const value = variety.recommendedTargetDensities[key];
  return Number.isFinite(value) && value > 0 ? value : null;
}

function updateSowingRecommendation(forceAutofill = false) {
  const variety = getSelectedVariety();
  const sowingTime = sowingTimeSelect?.value ?? "mid";
  const recommended = getRecommendedTargetDensity(variety, sowingTime);

  if (recommendedDensityHint) {
    recommendedDensityHint.textContent =
      recommended != null
        ? `Empfohlener Zielbestand: ${formatNumber(recommended, 0)} Pflanzen/m²`
        : "Empfohlener Zielbestand: Keine Angabe";
  }

  if (!targetDensityInput) {
    return;
  }

  const userEdited = targetDensityInput.dataset.autofilled === "false";

  if (recommended != null) {
    targetDensityInput.dataset.recommended = String(recommended);
    if (forceAutofill || !targetDensityInput.value || targetDensityInput.dataset.autofilled === "true") {
      targetDensityInput.value = formatNumberForInput(recommended, 0);
      targetDensityInput.dataset.autofilled = "true";
    }
  } else if (forceAutofill && !userEdited) {
    targetDensityInput.value = "";
    targetDensityInput.dataset.autofilled = "true";
  }
}

function getDefaultCalculatorState() {
  return {
    varietyId: "",
    sowingTime: "mid",
    fieldEmergence: 0.9,
    targetDensity: null,
    filledAmount: null,
    currentArea: 0
  };
}

function loadCalculatorState() {
  try {
    const stored = localStorage.getItem(CALCULATOR_STATE_KEY);
    if (!stored) {
      return getDefaultCalculatorState();
    }
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      return {
        varietyId: typeof parsed.varietyId === "string" ? parsed.varietyId : "",
        sowingTime: ["early", "mid", "late"].includes(parsed.sowingTime) ? parsed.sowingTime : "mid",
        fieldEmergence:
          Number.isFinite(parsed.fieldEmergence) && parsed.fieldEmergence > 0
            ? parsed.fieldEmergence
            : 0.9,
        targetDensity:
          Number.isFinite(parsed.targetDensity) && parsed.targetDensity > 0 ? parsed.targetDensity : null,
        filledAmount:
          Number.isFinite(parsed.filledAmount) && parsed.filledAmount > 0 ? parsed.filledAmount : null,
        currentArea:
          Number.isFinite(parsed.currentArea) && parsed.currentArea >= 0 ? parsed.currentArea : 0
      };
    }
  } catch (error) {
    console.warn("Konnte gespeicherten Rechnerzustand nicht laden.", error);
  }
  return getDefaultCalculatorState();
}

function saveCalculatorState(state) {
  try {
    localStorage.setItem(CALCULATOR_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Konnte Rechnerzustand nicht speichern.", error);
  }
}

function getCalculatorStateFromInputs(overrides = {}) {
  const rawVarietyId = varietySelect?.value ?? "";
  const sowingTime =
    ["early", "mid", "late"].includes(sowingTimeSelect?.value) ? sowingTimeSelect.value : "mid";
  const fieldEmergence = parseNumberOrNull(fieldEmergenceSelect?.value) ?? 0.9;
  const targetDensity = parsePositiveNumberOrNull(targetDensityInput?.value);
  const filledAmount = parsePositiveNumberOrNull(filledAmountInput?.value);
  const currentArea = parseNonNegativeNumberOrNull(currentAreaInput?.value) ?? 0;

  return {
    varietyId: rawVarietyId,
    sowingTime,
    fieldEmergence,
    targetDensity,
    filledAmount,
    currentArea,
    ...overrides
  };
}

function applyCalculatorState(state) {
  const normalized = state ?? getDefaultCalculatorState();

  if (varietySelect) {
    if (normalized.varietyId && seeds.some((seed) => seed.id === normalized.varietyId)) {
      varietySelect.value = normalized.varietyId;
    } else {
      varietySelect.value = "";
    }
  }

  if (sowingTimeSelect) {
    sowingTimeSelect.value = ["early", "mid", "late"].includes(normalized.sowingTime)
      ? normalized.sowingTime
      : "mid";
  }

  if (fieldEmergenceSelect) {
    const targetValue = String(normalized.fieldEmergence ?? 0.9);
    const optionValues = Array.from(fieldEmergenceSelect.options ?? []).map((option) => option.value);
    fieldEmergenceSelect.value = optionValues.includes(targetValue)
      ? targetValue
      : optionValues[0] ?? "0.9";
  }

  if (targetDensityInput) {
    if (Number.isFinite(normalized.targetDensity) && normalized.targetDensity > 0) {
      targetDensityInput.value = formatNumberForInput(normalized.targetDensity, 0);
      targetDensityInput.dataset.autofilled = "false";
    } else {
      targetDensityInput.value = "";
      if (!targetDensityInput.dataset.autofilled) {
        targetDensityInput.dataset.autofilled = "true";
      }
    }
  }

  if (filledAmountInput) {
    filledAmountInput.value =
      Number.isFinite(normalized.filledAmount) && normalized.filledAmount > 0
        ? formatNumberForInput(normalized.filledAmount, 2)
        : "";
  }

  if (currentAreaInput) {
    currentAreaInput.value =
      Number.isFinite(normalized.currentArea) && normalized.currentArea >= 0
        ? formatNumberForInput(normalized.currentArea, 2)
        : "0";
  }

  calculatorState = normalized;
  updateSowingRecommendation(!Number.isFinite(normalized.targetDensity));
}

function updateCalculatorStateFromInputs(save = true, overrides = {}) {
  calculatorState = {
    ...getDefaultCalculatorState(),
    ...calculatorState,
    ...getCalculatorStateFromInputs(overrides)
  };

  if (save) {
    saveCalculatorState(calculatorState);
  }
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




