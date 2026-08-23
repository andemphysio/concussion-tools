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
const diagnosticSymptomCount = document.querySelector("#diagnostic-symptom-count");
const diagnosticSeverityScore = document.querySelector("#diagnostic-severity-score");
const monitoringSymptomCount = document.querySelector("#monitoring-symptom-count");
const monitoringSeverityScore = document.querySelector("#monitoring-severity-score");
const singleTotals = document.querySelector("#single-totals");
const combinedTotals = document.querySelector("#combined-totals");
const injuryDate = document.querySelector("#injury-date");
const completionDate = document.querySelector("#completion-date");
const daysSinceInjury = document.querySelector("#days-since-injury");
const dateMessage = document.querySelector("#date-message");
const evaluationTypes = form.querySelectorAll('input[name="evaluation-type"]');
const symptomContexts = form.querySelectorAll('input[name="symptom-context"]');
const postInjuryModes = form.querySelectorAll('input[name="post-injury-mode"]');
const postInjuryPeriods = form.querySelectorAll('input[name="diagnostic-period"], input[name="monitoring-period"]');
const symptomContextOptions = document.querySelector("#symptom-context-options");
const postInjuryOptions = document.querySelector("#post-injury-options");
const diagnosticPeriodOptions = document.querySelector("#diagnostic-period-options");
const monitoringPeriodOptions = document.querySelector("#monitoring-period-options");
const physicalActivityInputs = form.querySelectorAll('input[name="physical-activity"]');
const mentalActivityInputs = form.querySelectorAll('input[name="mental-activity"]');
const activitySymptomHint = document.querySelector("#activity-symptom-hint");
const baselineInstruction = document.querySelector("#baseline-instruction");
const postInjuryInstruction = document.querySelector("#post-injury-instruction");
const postInjuryInstructionText = document.querySelector("#post-injury-instruction-text");
const combinedInstructions = document.querySelector("#combined-instructions");
const combinedDiagnosticInstructionText = document.querySelector("#combined-diagnostic-instruction-text");
const combinedMonitoringInstructionText = document.querySelector("#combined-monitoring-instruction-text");
const primaryRatingHeading = document.querySelector("#primary-rating-heading");
const monitoringRatingHeading = document.querySelector("#monitoring-rating-heading");
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
  const monitoringRatingOptions = Array.from({ length: 7 }, (_, rating) => `
    <label class="rating-label monitoring-rating-label" aria-label="${symptom} monitoring: ${rating}">
      <input type="radio" name="monitoring-symptom-${symptomIndex}" value="${rating}" />
      <span>${rating}</span>
    </label>
  `).join("");

  row.innerHTML = `
    <td class="symptom-name">
      <div class="symptom-name-content">
        <span>${symptom}</span>
        <span class="activity-symptom-selectors">
          <label class="activity-symptom-toggle physical-toggle" hidden title="Worse with physical activity">
            <input type="checkbox" name="physical-worse-${symptomIndex}" />
            <span aria-hidden="true">P</span>
            <span class="sr-only">${symptom} gets worse with physical activity</span>
          </label>
          <label class="activity-symptom-toggle mental-toggle" hidden title="Worse with mental activity">
            <input type="checkbox" name="mental-worse-${symptomIndex}" />
            <span aria-hidden="true">M</span>
            <span class="sr-only">${symptom} gets worse with mental activity</span>
          </label>
        </span>
      </div>
    </td>
    <td><div class="ratings">${ratingOptions}</div></td>
    <td class="monitoring-rating-column" hidden><div class="ratings">${monitoringRatingOptions}</div></td>
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

  const monitoringRatings = symptoms
    .map((_, index) => form.querySelector(`input[name="monitoring-symptom-${index}"]:checked`))
    .filter(Boolean)
    .map((input) => Number(input.value));

  diagnosticSymptomCount.value = symptomCount.value;
  diagnosticSeverityScore.value = severityScore.value;
  monitoringSymptomCount.value = monitoringRatings.filter((rating) => rating > 0).length;
  monitoringSeverityScore.value = monitoringRatings.reduce((total, rating) => total + rating, 0);
}

function getRatedSymptoms(prefix = "symptom") {
  return symptoms
    .map((symptom, index) => {
      const selectedRating = form.querySelector(`input[name="${prefix}-${index}"]:checked`);
      return selectedRating ? { symptom, rating: Number(selectedRating.value) } : null;
    })
    .filter((item) => item?.rating > 0);
}

function getActivityWorsenedSymptoms(activity) {
  return symptoms.filter((_, index) => form.elements[`${activity}-worse-${index}`].checked);
}

function getSummaryText() {
  const daysPostInjury = daysSinceInjury.value === "—" ? "Not available" : daysSinceInjury.value;
  const percentNormal = form.elements["percent-normal"].value;
  const selectedEvaluationType = form.querySelector('input[name="evaluation-type"]:checked')?.value;
  const selectedSymptomContext = form.querySelector('input[name="symptom-context"]:checked')?.value;
  const selectedPostInjuryMode = form.querySelector('input[name="post-injury-mode"]:checked')?.value;
  const selectedPeriod = selectedPostInjuryMode && selectedPostInjuryMode !== "combined"
    ? form.querySelector(`input[name="${selectedPostInjuryMode}-period"]:checked`)?.value
    : null;
  const assessmentMode =
    selectedEvaluationType === "baseline"
      ? "Baseline"
      : selectedPostInjuryMode
        ? selectedPostInjuryMode[0].toUpperCase() + selectedPostInjuryMode.slice(1)
        : "Not selected";
  const symptomContext = selectedSymptomContext
    ? selectedSymptomContext[0].toUpperCase() + selectedSymptomContext.slice(1)
    : "Not selected";
  const ratedSymptoms = getRatedSymptoms();
  const monitoringRatedSymptoms = getRatedSymptoms("monitoring-symptom");
  const physicalWorsenedSymptoms = getActivityWorsenedSymptoms("physical");
  const mentalWorsenedSymptoms = getActivityWorsenedSymptoms("mental");
  const symptomLines = ratedSymptoms.length
    ? ratedSymptoms.map(({ symptom, rating }) => `- ${symptom}: ${rating}/6`).join("\n")
    : "- No symptoms scored above 0.";

  const activityLines = [
    ...(physicalWorsenedSymptoms.length
      ? [`Worse with physical activity: ${physicalWorsenedSymptoms.join(", ")}`]
      : []),
    ...(mentalWorsenedSymptoms.length
      ? [`Worse with mental activity: ${mentalWorsenedSymptoms.join(", ")}`]
      : []),
  ];

  if (selectedPostInjuryMode === "combined") {
    return [
      "SCAT-6 Symptoms List Key Findings:",
      "Assessment mode: Diagnostic + Monitoring",
      `Days post injury: ${daysPostInjury}`,
      `Percentage of normal: ${percentNormal ? `${percentNormal}%` : "Not provided"}`,
      "",
      "Diagnostic:",
      `Time period: ${form.querySelector('input[name="diagnostic-period"]:checked')?.value ?? "Not selected"}`,
      `Number of symptoms: ${diagnosticSymptomCount.value}/22`,
      `Severity score: ${diagnosticSeverityScore.value}/132`,
      "Symptoms:",
      ...(ratedSymptoms.length
        ? ratedSymptoms.map(({ symptom, rating }) => `- ${symptom}: ${rating}/6`)
        : ["- No symptoms scored above 0."]),
      "",
      "Monitoring:",
      `Time period: ${form.querySelector('input[name="monitoring-period"]:checked')?.value ?? "Not selected"}`,
      `Symptom context: ${symptomContext}`,
      `Number of symptoms: ${monitoringSymptomCount.value}/22`,
      `Severity score: ${monitoringSeverityScore.value}/132`,
      ...activityLines,
      "Symptoms:",
      ...(monitoringRatedSymptoms.length
        ? monitoringRatedSymptoms.map(({ symptom, rating }) => `- ${symptom}: ${rating}/6`)
        : ["- No symptoms scored above 0."]),
    ].join("\n");
  }

  return [
    "SCAT-6 Symptoms List Key Findings:",
    `Assessment mode: ${assessmentMode}`,
    ...(selectedPostInjuryMode === "monitoring" ? [`Symptom context: ${symptomContext}`] : []),
    ...(selectedEvaluationType === "post-injury"
      ? [`Time period: ${selectedPeriod ?? "Not selected"}`]
      : []),
    `Days post injury: ${daysPostInjury}`,
    `Percentage of normal: ${percentNormal ? `${percentNormal}%` : "Not provided"}`,
    `Number of symptoms: ${symptomCount.value}/22`,
    `Severity score: ${severityScore.value}/132`,
    ...activityLines,
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

function setInstructionText(element, parts) {
  const nodes = parts.map((part) => {
    if (typeof part === "string") {
      return part;
    }

    const underline = document.createElement("u");
    underline.textContent = part.underline;
    return underline;
  });

  element.replaceChildren(...nodes);
}

function getDiagnosticRatingHeading(period) {
  if (period === "now") {
    return "Rating (now)";
  }

  const abbreviatedPeriod = period === "within 24 hours" ? "24h" : period?.replace(" hours", "h");
  return abbreviatedPeriod ? `Rating (within ${abbreviatedPeriod} after injury)` : "Diagnostic rating";
}

function getMonitoringRatingHeading(period) {
  if (period === "now") {
    return "Rating (now)";
  }

  const abbreviatedPeriod = period?.replace(" hours", "h");
  return abbreviatedPeriod ? `Rating (${abbreviatedPeriod})` : "Monitoring rating";
}

function updateEvaluationInstruction() {
  const selectedType = form.querySelector('input[name="evaluation-type"]:checked')?.value;
  const selectedSymptomContext = form.querySelector('input[name="symptom-context"]:checked')?.value;
  const selectedPostInjuryMode = form.querySelector('input[name="post-injury-mode"]:checked')?.value;
  const selectedDiagnosticPeriod = form.querySelector('input[name="diagnostic-period"]:checked')?.value;
  const selectedMonitoringPeriod = form.querySelector('input[name="monitoring-period"]:checked')?.value;

  postInjuryOptions.hidden = selectedType !== "post-injury";
  const isCombined = selectedType === "post-injury" && selectedPostInjuryMode === "combined";
  document.body.classList.toggle("combined-assessment", isCombined);
  diagnosticPeriodOptions.hidden =
    selectedType !== "post-injury" || (selectedPostInjuryMode !== "diagnostic" && !isCombined);
  monitoringPeriodOptions.hidden =
    selectedType !== "post-injury" || (selectedPostInjuryMode !== "monitoring" && !isCombined);
  symptomContextOptions.hidden =
    selectedType !== "post-injury" || (selectedPostInjuryMode !== "monitoring" && !isCombined);
  baselineInstruction.hidden = selectedType !== "baseline";
  postInjuryInstruction.hidden = selectedType !== "post-injury" || isCombined;
  combinedInstructions.hidden = !isCombined;
  singleTotals.hidden = isCombined;
  combinedTotals.hidden = !isCombined;
  monitoringRatingHeading.hidden = !isCombined;
  form.querySelectorAll(".monitoring-rating-column").forEach((column) => {
    column.hidden = !isCombined;
  });
  primaryRatingHeading.textContent = isCombined
    ? getDiagnosticRatingHeading(selectedDiagnosticPeriod)
    : "Rating";
  monitoringRatingHeading.textContent = getMonitoringRatingHeading(selectedMonitoringPeriod);

  const contextPhrase = selectedSymptomContext === "not selected" ? null : selectedSymptomContext;
  const retrospectivePrefix = contextPhrase === "typically"
    ? "how you have "
    : "how you have been feeling";
  const retrospectiveContext = contextPhrase
    ? contextPhrase === "typically"
      ? [{ underline: "typically" }, " been feeling"]
      : [" ", { underline: contextPhrase }]
    : [];
  const currentPrefix = contextPhrase === "typically" ? "how you " : "how you feel";
  const currentContext = contextPhrase
    ? contextPhrase === "typically"
      ? [{ underline: "typically" }, " feel"]
      : [" ", { underline: contextPhrase }]
    : [];

  if (selectedPostInjuryMode === "diagnostic" || isCombined) {
    if (selectedDiagnosticPeriod === "now") {
      setInstructionText(isCombined ? combinedDiagnosticInstructionText : postInjuryInstructionText, [
        "“Please rate your symptoms below based on how you feel ",
        { underline: "now" },
        " with “1” representing a very mild symptom and “6” representing a severe symptom.”",
      ]);
    } else if (selectedDiagnosticPeriod === "within 24 hours") {
      setInstructionText(isCombined ? combinedDiagnosticInstructionText : postInjuryInstructionText, [
        "“Please rate your symptoms below based on how you have been feeling ",
        { underline: "within 24 hours after injury" },
        " with “1” representing a very mild symptom and “6” representing a severe symptom.”",
      ]);
    } else {
      setInstructionText(isCombined ? combinedDiagnosticInstructionText : postInjuryInstructionText, [
        "“Please rate your symptoms below based on how you have been feeling ",
        { underline: `within ${selectedDiagnosticPeriod} after injury` },
        " with “1” representing a very mild symptom and “6” representing a severe symptom.”",
      ]);
    }
  }

  if (selectedPostInjuryMode === "monitoring" || isCombined) {
    const monitoringInstructionTarget = isCombined ? combinedMonitoringInstructionText : postInjuryInstructionText;
    if (selectedMonitoringPeriod === "now") {
      setInstructionText(monitoringInstructionTarget, [
        `“Please rate your symptoms below based on ${currentPrefix}`,
        ...currentContext,
        " ",
        { underline: "now" },
        " with “1” representing a very mild symptom and “6” representing a severe symptom.”",
      ]);
    } else if (selectedMonitoringPeriod) {
      setInstructionText(monitoringInstructionTarget, [
        `“Please rate your symptoms below based on ${retrospectivePrefix}`,
        ...retrospectiveContext,
        " over the ",
        { underline: selectedMonitoringPeriod },
        " with “1” representing a very mild symptom and “6” representing a severe symptom.”",
      ]);
    }
  } else if (selectedPostInjuryMode !== "diagnostic" && !isCombined) {
    postInjuryInstructionText.textContent = "Select Diagnostic or Monitoring to show the appropriate instruction.";
  }
}

function updateActivitySymptomSelectors() {
  const physicalActivityWorse = form.querySelector('input[name="physical-activity"]:checked')?.value === "yes";
  const mentalActivityWorse = form.querySelector('input[name="mental-activity"]:checked')?.value === "yes";

  activitySymptomHint.hidden = !physicalActivityWorse && !mentalActivityWorse;
  if (activitySymptomHint.hidden) {
    activitySymptomHint.replaceChildren();
  } else if (physicalActivityWorse && mentalActivityWorse) {
    activitySymptomHint.replaceChildren(
      "Select ",
      createActivityHintBadge("P", "physical"),
      " or ",
      createActivityHintBadge("M", "mental"),
      " beside any symptoms that get worse with physical ",
      createActivityHintBadge("P", "physical"),
      " or mental ",
      createActivityHintBadge("M", "mental"),
      " activity.",
    );
  } else if (physicalActivityWorse) {
    activitySymptomHint.replaceChildren(
      "Select ",
      createActivityHintBadge("P", "physical"),
      " beside any symptoms that get worse with activity.",
    );
  } else {
    activitySymptomHint.replaceChildren(
      "Select ",
      createActivityHintBadge("M", "mental"),
      " beside any symptoms that get worse with activity.",
    );
  }

  symptoms.forEach((_, index) => {
    const selectedPostInjuryMode = form.querySelector('input[name="post-injury-mode"]:checked')?.value;
    const ratingPrefix = selectedPostInjuryMode === "combined" ? "monitoring-symptom" : "symptom";
    const selectedRating = Number(form.querySelector(`input[name="${ratingPrefix}-${index}"]:checked`)?.value ?? 0);
    const symptomIsPresent = selectedRating > 0;
    const physicalToggle = form.querySelector(`input[name="physical-worse-${index}"]`).closest(".physical-toggle");
    const mentalToggle = form.querySelector(`input[name="mental-worse-${index}"]`).closest(".mental-toggle");

    physicalToggle.hidden = !physicalActivityWorse || !symptomIsPresent;
    if (physicalToggle.hidden) {
      physicalToggle.querySelector("input").checked = false;
    }

    mentalToggle.hidden = !mentalActivityWorse || !symptomIsPresent;
    if (mentalToggle.hidden) {
      mentalToggle.querySelector("input").checked = false;
    }
  });
}

function createActivityHintBadge(label, activity) {
  const badge = document.createElement("span");
  badge.className = `activity-hint-badge ${activity}-toggle`;
  badge.textContent = label;
  return badge;
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
  updateActivitySymptomSelectors();
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
form.addEventListener("change", updateActivitySymptomSelectors);
form.addEventListener("input", updateSummary);
form.addEventListener("change", updateSummary);
form.addEventListener("input", recordFormState);
form.addEventListener("change", recordFormState);
evaluationTypes.forEach((input) => input.addEventListener("change", updateEvaluationInstruction));
symptomContexts.forEach((input) => input.addEventListener("change", updateEvaluationInstruction));
postInjuryModes.forEach((input) => input.addEventListener("change", updateEvaluationInstruction));
postInjuryPeriods.forEach((input) => input.addEventListener("change", updateEvaluationInstruction));
physicalActivityInputs.forEach((input) => input.addEventListener("change", updateActivitySymptomSelectors));
mentalActivityInputs.forEach((input) => input.addEventListener("change", updateActivitySymptomSelectors));
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
