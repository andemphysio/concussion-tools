# Concussion Tools

A collection of freely available concussion-management tools for healthcare
professionals, including CISG-approved browser-based SCAT6 symptoms-list
adaptations.

## Use online

The quickest way to use the tools is in your web browser. Nothing needs to be
downloaded or installed:

- [Open the version chooser](https://andemphysio.github.io/concussion-tools/)
- [Open the Modified SCAT-6 Symptoms List — Version 2.5](https://andemphysio.github.io/concussion-tools/version-2/)
- [Open the Original SCAT-6 Symptoms List — Version 1.5](https://andemphysio.github.io/concussion-tools/version-1/)

## Available versions

Choose between the latest modified version and the original SCAT-6 Symptoms List.

### Version 2.5

The **Modified SCAT-6 Symptoms List** retains the Version 1 features and adds:

- Baseline, Diagnostic, Monitoring, and combined Diagnostic + Monitoring modes.
- Diagnostic periods from now through 72 hours post-injury.
- Monitoring periods from now through the previous two weeks.
- Optional monitoring context: typically, at rest, or during/after exercise.
- Separate diagnostic and monitoring ratings, totals, and clinical summaries.
- Physical (P) and mental (M) activity-worsening markers for positive symptoms.
- Responsive, colour-coded controls and compact clinical print layouts.

[Open Version 2.5](https://andemphysio.github.io/concussion-tools/version-2/)

### Version 1.5

The **Original SCAT-6 Symptoms List** provides:

- All 22 SCAT6 symptom items, rated from 0 to 6.
- Baseline and suspected/post-injury assessment options.
- Automatic symptom-count and severity-score calculations.
- Patient identifier, injury date, completion date, and days-since-injury fields.
- Physical- and mental-activity questions and percentage-of-normal fields.
- Undo, redo, clear-form, clinical-summary copying, and browser-based printing.
- Portrait and landscape print options.

[Open Version 1.5](https://andemphysio.github.io/concussion-tools/version-1/)

## Run locally (offline use)

You can download either version and run it directly on your computer. No
technical setup is needed.

1. Download the version you want:
   - [Download Version 2.5 — Modified SCAT-6 Symptoms List](https://github.com/andemphysio/concussion-tools/raw/refs/heads/main/downloads/scat6-symptoms-list-2.5.zip)
   - [Download Version 1.5 — Original SCAT-6 Symptoms List](https://github.com/andemphysio/concussion-tools/raw/refs/heads/main/downloads/scat6-symptoms-list-1.5.zip)
2. Find the downloaded ZIP file, usually in your **Downloads** folder.
3. Double-click the ZIP file to unpack it.
4. Open the new folder that appears.
5. Double-click **`index.html`**.
6. The application will open in your usual web browser and is ready to use.

Keep `index.html`, `styles.css`, and `app.js` together in the same folder. You
do not need to open or change `styles.css` or `app.js`.

## Clinical-use notice

These tools are intended to support appropriately qualified healthcare professionals. They do not replace clinical judgement, a complete clinical assessment, diagnosis, treatment, emergency evaluation, or a full SCAT6 or SCOAT6 assessment when indicated.

The applications are designed with privacy in mind. They do not send the information you enter to third parties or external services. After downloading either application, you can use it in your web browser without an internet connection. Users remain responsible for handling, printing, saving, and disposing of health information in accordance with their professional and legal obligations.

## Approval, copyright, and licence

Both symptoms-list adaptations have been approved by the Concussion in Sport
Group (CISG) and BMJ. SCAT6 content is owned by CISG-BMJ and is not relicensed by this
repository. The implementation code is open source under the [MIT License](LICENSE).
The `LICENSE` file explains the boundary between the software licence and the
SCAT6 content rights.

## The author

Andrea De Marchi is a physiotherapist and lecturer based in Birmingham (UK), with extensive experience in concussion management. 

Reach out on [LinkedIn](https://uk.linkedin.com/in/andrea-de-marchi-777423305) if you would like to connect.

## Repository structure

- `index.html` and `styles.css`: version chooser.
- `version-1/`: complete Version 1.5 browser application.
- `version-2/`: complete Version 2.5 browser application.
- `downloads/`: ready-to-use ZIP downloads for both versions.
- `LICENSE`: CISG-BMJ rights notice and MIT code licence.
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow.
