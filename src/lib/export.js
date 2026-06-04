// On-device export helpers. "Export" here means handing a file to the user
// via the browser's own download/print — it never uploads anything.

// Trigger a local file download from an in-memory Blob. The object URL is
// same-origin (blob:) and is revoked immediately after the click.
export function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Print the current view. Users pick "Save as PDF" in the print dialog to
// get a PDF — fully offline, no PDF library, no upload.
export function printView() {
  window.print();
}

// Build a safe, human-readable filename from app + timestamp.
export function recordFilename(appId, savedAt) {
  const stamp = (savedAt || new Date().toISOString())
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  return `${appId}_${stamp}`;
}
