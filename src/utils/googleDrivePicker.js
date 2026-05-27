/**
 * Google Drive File Picker Utility
 *
 * Opens the Google Picker dialog, lets the user select a spreadsheet
 * (.csv / .xlsx) from their Google Drive, then downloads its content
 * as a File object ready for bulk upload.
 *
 * Prerequisites:
 *   - Google API Key (VITE_GOOGLE_API_KEY)
 *   - Google OAuth 2.0 Client ID (VITE_GOOGLE_CLIENT_ID)
 *   - Google Picker API enabled in Google Cloud Console
 *   - The script https://apis.google.com/js/api.js must be loaded in index.html
 *
 * Usage:
 *   import { pickFileFromGoogleDrive } from "../../utils/googleDrivePicker";
 *   const file = await pickFileFromGoogleDrive();
 *   if (file) { /* use like a normal File * / }
 */

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || "";

// MIME types we accept via the picker
const ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  // Google Sheets native format - we'll export as xlsx
  "application/vnd.google-apps.spreadsheet",
];

/** OAuth scopes needed */
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

let tokenClient = null;
let accessToken = null;

/* ─────────────────────────────────────────────
   Load GAPI client
───────────────────────────────────────────── */
function loadGapi() {
  return new Promise((resolve, reject) => {
    if (window.gapi?.load) {
      resolve();
      return;
    }
    // gapi should already be loaded via script tag; give it a short grace
    let attempts = 0;
    const iv = setInterval(() => {
      if (window.gapi?.load) {
        clearInterval(iv);
        resolve();
      }
      attempts++;
      if (attempts > 50) {
        clearInterval(iv);
        reject(new Error("Google API (gapi) not loaded. Check index.html script tag."));
      }
    }, 100);
  });
}

/* ─────────────────────────────────────────────
   Acquire OAuth token (one-time per session)
───────────────────────────────────────────── */
async function getAccessToken() {
  if (accessToken) return accessToken;

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error));
            return;
          }
          accessToken = resp.access_token;
          resolve(accessToken);
        },
      });
    }

    if (window.gapi?.client?.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });
}

/* ─────────────────────────────────────────────
   Download file content from Drive
───────────────────────────────────────────── */
async function downloadFile(fileId, mimeType, name) {
  const token = await getAccessToken();

  let url;
  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    // Export Google Sheet as XLSX
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  } else {
    url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Download failed (${response.status}): ${errBody}`);
  }

  const blob = await response.blob();

  // Determine extension and MIME for the returned File
  let finalName = name;
  let finalType = mimeType;
  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    finalName = name.replace(/\.\w+$/, "") + ".xlsx";
    finalType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return new File([blob], finalName, { type: finalType });
}

/* ─────────────────────────────────────────────
   PUBLIC: open Google Picker & return File
───────────────────────────────────────────── */
export async function pickFileFromGoogleDrive() {
  if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google Drive integration is not configured. Set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID in .env."
    );
  }

  await loadGapi();

  // Load picker library
  await new Promise((resolve, reject) => {
    window.gapi.load("picker", { callback: resolve, onerror: reject });
  });

  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const view = new window.google.picker.DocsView(
      window.google.picker.ViewId.SPREADSHEETS
    )
      .setMimeTypes(ACCEPTED_MIME_TYPES.join(","))
      .setIncludeFolders(false);

    const picker = new window.google.picker.PickerBuilder()
      .setAppId(GOOGLE_APP_ID || GOOGLE_CLIENT_ID)
      .setOAuthToken(token)
      .addView(view)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs?.[0];
          if (!doc) {
            reject(new Error("No document selected"));
            return;
          }
          try {
            const file = await downloadFile(doc.id, doc.mimeType, doc.name);
            resolve(file);
          } catch (err) {
            reject(err);
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null); // user cancelled
        }
      })
      .build();

    picker.setVisible(true);
  });
}