const symptoms = [
  "Headaches",
  "Pressure in head",
  "Neck pain",
  "Nausea or vomiting",
  "Dizziness",
  "Blurred vision",
  "Balance problems",
  "Sensitivity to light",
  "Sensitivity to noise",
  "Feeling slowed down",
  "Feeling like “in a fog”",
  "“Don’t feel right”",
  "Difficulty concentrating",
  "Difficulty remembering",
  "Fatigue or low energy",
  "Confusion",
  "Drowsiness",
  "More emotional",
  "Irritability",
  "Sadness",
  "Nervous or anxious",
  "Trouble falling asleep (if applicable)",
];

const rows = document.querySelector("#symptom-rows");
const form = document.querySelector("#symptom-form");
const symptomCount = document.querySelector("#symptom-count");
const severityScore = document.querySelector("#severity-score");
const injuryDate = document.querySelector("#injury-date");
const completionDate = document.querySelector("#completion-date");
const daysSinceInjury = document.querySelector("#days-since-injury");
const dateMessage = document.querySelector("#date-message");
const evaluationTypes = form.querySelectorAll('input[name="evaluation-type"]');
const baselineInstruction = document.querySelector("#baseline-instruction");
const postInjuryInstruction = document.querySelector("#post-injury-instruction");
const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");
const printButton = document.querySelector("#print-button");
const printOrientation = document.querySelector("#print-orientation");
const printPageStyle = document.querySelector("#print-page-style");
const summaryText = document.querySelector("#summary-text");
const summaryPrintContent = document.querySelector("#summary-print-content");
const copySummaryButton = document.querySelector("#copy-summary-button");
const copySummaryStatus = document.querySelector("#copy-summary-status");
const includeSummaryPrint = document.querySelector("#include-summary-print");
const historyLimit = 100;
let formHistory = [];
let historyIndex = -1;
let isRestoringHistory = false;

symptoms.forEach((symptom, symptomIndex) => {
  const row = document.createElement("tr");
  const ratingOptions = Array.from({ length: 7 }, (_, rating) => `
    <label class="rating-label" aria-label="${symptom}: ${rating}">
      <input type="radio" name="symptom-${symptomIndex}" value="${rating}" />
      <span>${rating}</span>
    </label>
  `).join("");

  row.innerHTML = `
    <td class="symptom-name">${symptom}</td>
    <td><div class="ratings">${ratingOptions}</div></td>
  `;
  rows.appendChild(row);
});

function updateTotals() {
  const ratings = symptoms
    .map((_, index) => form.querySelector(`input[name="symptom-${index}"]:checked`))
    .filter(Boolean)
    .map((input) => Number(input.value));

  symptomCount.value = ratings.filter((rating) => rating > 0).length;
  severityScore.value = ratings.reduce((total, rating) => total + rating, 0);
}

function getRatedSymptoms() {
  return symptoms
    .map((symptom, index) => {
      const selectedRating = form.querySelector(`input[name="symptom-${index}"]:checked`);
      return selectedRating ? { symptom, rating: Number(selectedRating.value) } : null;
    })
    .filter((item) => item?.rating > 0);
}

function getSummaryText() {
  const daysPostInjury = daysSinceInjury.value === "—" ? "Not available" : daysSinceInjury.value;
  const percentNormal = form.elements["percent-normal"].value;
  const ratedSymptoms = getRatedSymptoms();
  const symptomLines = ratedSymptoms.length
    ? ratedSymptoms.map(({ symptom, rating }) => `- ${symptom}: ${rating}/6`).join("\n")
    : "- No symptoms scored above 0.";

  return [
    "SCAT-6 Symptoms List Key Findings:",
    `Days post injury: ${daysPostInjury}`,
    `Percentage of normal: ${percentNormal ? `${percentNormal}%` : "Not provided"}`,
    `Number of symptoms: ${symptomCount.value}/22`,
    `Severity score: ${severityScore.value}/132`,
    "",
    "Symptoms:",
    symptomLines,
  ].join("\n");
}

function updateSummary() {
  const summary = getSummaryText();
  summaryText.value = summary;
  summaryPrintContent.textContent = summary;
  copySummaryStatus.textContent = "";
  summaryText.style.height = "auto";
  summaryText.style.height = `${summaryText.scrollHeight}px`;
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateAsUtc(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function updateDaysSinceInjury() {
  dateMessage.textContent = "";

  if (!injuryDate.value || !completionDate.value) {
    daysSinceInjury.value = "—";
    return;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const elapsedDays = Math.round(
    (parseDateAsUtc(completionDate.value) - parseDateAsUtc(injuryDate.value)) / millisecondsPerDay,
  );

  if (elapsedDays < 0) {
    daysSinceInjury.value = "—";
    dateMessage.textContent = "The completion date cannot be before the injury date.";
    return;
  }

  daysSinceInjury.value = String(elapsedDays);
}

function updateEvaluationInstruction() {
  const selectedType = form.querySelector('input[name="evaluation-type"]:checked')?.value;
  baselineInstruction.hidden = selectedType !== "baseline";
  postInjuryInstruction.hidden = selectedType !== "post-injury";
}

function getHistoryControls() {
  return Array.from(form.elements).filter(
    (control) => control.matches("input, textarea") && control.type !== "button" && control.type !== "reset",
  );
}

function getFormState() {
  return getHistoryControls().map((control) => ({
    checked: control.checked,
    value: control.value,
  }));
}

function updateHistoryButtons() {
  undoButton.disabled = historyIndex <= 0;
  redoButton.disabled = historyIndex >= formHistory.length - 1;
}

function recordFormState() {
  if (isRestoringHistory) {
    return;
  }

  const state = getFormState();
  const currentState = formHistory[historyIndex];

  if (currentState && JSON.stringify(state) === JSON.stringify(currentState)) {
    return;
  }

  formHistory = formHistory.slice(0, historyIndex + 1);
  formHistory.push(state);
  if (formHistory.length > historyLimit) {
    formHistory.shift();
  }
  historyIndex = formHistory.length - 1;
  updateHistoryButtons();
}

function updateDerivedFields() {
  updateDaysSinceInjury();
  updateEvaluationInstruction();
  updateTotals();
  updateSummary();
  applySummaryPrintPreference();
}

function restoreFormState(state) {
  isRestoringHistory = true;
  getHistoryControls().forEach((control, index) => {
    control.value = state[index].value;
    control.checked = state[index].checked;
  });
  updateDerivedFields();
  isRestoringHistory = false;
  updateHistoryButtons();
}

function moveThroughHistory(direction) {
  const nextIndex = historyIndex + direction;

  if (nextIndex < 0 || nextIndex >= formHistory.length) {
    return;
  }

  historyIndex = nextIndex;
  restoreFormState(formHistory[historyIndex]);
}

function resetCalculatedFields() {
  completionDate.value = getLocalDateValue();
  updateDerivedFields();
  recordFormState();
}

function applyPrintOrientation() {
  const orientation = printOrientation.value;
  document.body.classList.toggle("print-landscape", orientation === "landscape");
  document.body.classList.toggle("print-portrait", orientation === "portrait");
  printPageStyle.textContent = `@page { size: ${orientation}; margin: 15mm 10mm; }`;
}

function applySummaryPrintPreference() {
  document.body.classList.toggle("include-summary-print", includeSummaryPrint.checked);
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(summaryText.value);
    copySummaryStatus.textContent = "Summary copied.";
  } catch {
    summaryText.select();
    document.execCommand("copy");
    summaryText.setSelectionRange(0, 0);
    copySummaryStatus.textContent = "Summary copied.";
  }
}

completionDate.value = getLocalDateValue();
updateDerivedFields();
recordFormState();
applyPrintOrientation();

form.addEventListener("change", updateTotals);
form.addEventListener("input", updateSummary);
form.addEventListener("change", updateSummary);
form.addEventListener("input", recordFormState);
form.addEventListener("change", recordFormState);
evaluationTypes.forEach((input) => input.addEventListener("change", updateEvaluationInstruction));
injuryDate.addEventListener("change", updateDaysSinceInjury);
completionDate.addEventListener("change", updateDaysSinceInjury);
form.addEventListener("reset", () => requestAnimationFrame(resetCalculatedFields));
undoButton.addEventListener("click", () => moveThroughHistory(-1));
redoButton.addEventListener("click", () => moveThroughHistory(1));
printOrientation.addEventListener("change", applyPrintOrientation);
includeSummaryPrint.addEventListener("change", applySummaryPrintPreference);
copySummaryButton.addEventListener("click", copySummary);
printButton.addEventListener("click", () => {
  applyPrintOrientation();
  applySummaryPrintPreference();
  window.print();
});
