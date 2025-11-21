// src/controllers/alertManager.js
// In-memory sliding-window manager. When condition met it calls createAlertRecord

import snapshotService from "../services/snapshotService.js";
import alertController from "./alertController.js";

export async function createAlertRecord(props) {
  console.log("[DEBUG] createAlertRecord props:", props);
}

// const createAlertRecord =
//   alertController.createAlertRecord ||
//   (alertController.default && alertController.default.createAlertRecord);

const SAMPLE_INTERVAL_S = 0.5; // seconds between detects
const WINDOW_S = 3; // 3 seconds
const WINDOW_SAMPLES = Math.ceil(WINDOW_S / SAMPLE_INTERVAL_S); // typically 6
const FIRE_SMOKE_RATIO = 0.66; // require >= 66% in window (e.g., 4/6)
const FALL_CONSECUTIVE = 2; // 2 consecutive -> trigger

// per source state
const states = {}; // { [source]: { buffer: [{label, confidence, ts}], lastTriggerAt, collectingSnapshots: boolean, alertID } }

function normalizeLabel(s) {
  if (!s) return "UNKNOWN";
  return String(s).toUpperCase().replace(/[_-]/g, " ").trim();
}

/**
 * Called by route POST /api/alerts/detect with body { label, confidence, source, snapshot? }
 * snapshot optional: base64 of frame to be used
 */
async function handleDetectionEvent(req, res) {
  try {
    console.log("[alertManager] handleDetectionEvent body:", {
      bodySample: req.body && Object.keys(req.body).slice(0, 10),
      label: req.body && req.body.label,
      source: req.body && req.body.source,
      snapshotPresent: !!(req.body && req.body.snapshot),
      ts: new Date().toISOString(),
    });

    if (typeof createAlertRecord !== "function") {
      console.error("[alertManager] createAlertRecord is not a function", {
        createAlertRecordType: typeof createAlertRecord,
        alertControllerKeys: Object.keys(alertController || {}),
      });
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const {
      label: rawLabel,
      confidence = 1.0,
      source = "camera1",
      snapshot = null,
    } = req.body;
    const label = normalizeLabel(rawLabel);

    const state = (states[source] = states[source] || {
      buffer: [],
      lastTriggerAt: 0,
      collectingSnapshots: false,
      alertID: null,
    });

    // push into buffer
    state.buffer.push({
      label,
      confidence: Number(confidence),
      ts: Date.now(),
      snapshot,
    });
    if (state.buffer.length > WINDOW_SAMPLES) state.buffer.shift();

    // evaluate rules
    // 1) fire / smoke check: count occurrences in buffer
    const counts = {};
    for (const it of state.buffer) {
      counts[it.label] = (counts[it.label] || 0) + 1;
    }

    const now = Date.now();
    // rate limit triggers from same source to 30 seconds
    const RATE_LIMIT_MS = 30 * 1000;
    console.log("[alertManager] state", {
      source,
      bufferLen: state.buffer.length,
      counts,
      lastTriggerAt: state.lastTriggerAt,
      sinceLast: now - state.lastTriggerAt,
    });
    if (now - state.lastTriggerAt < RATE_LIMIT_MS) {
      return res.json({ ok: true, message: "Rate limited" });
    }

    // fire or smoke rule
    const fireCount = counts["FIRE"] || 0;
    const smokeCount = counts["SMOKE"] || 0;
    const minNeeded = Math.ceil(WINDOW_SAMPLES * FIRE_SMOKE_RATIO);

    if (fireCount >= minNeeded || smokeCount >= minNeeded) {
      console.log(
        `[alertManager] trigger candidate: FIRE ${fireCount}, SMOKE ${smokeCount}, needed ${minNeeded})`
      );
      // create alert record and instruct caller to upload snapshots for this alert
      const alert_type = fireCount >= minNeeded ? "fire" : "smoke";
      const content = JSON.stringify({
        from: source,
        bufferCount: state.buffer.length,
      });
      const initialSnapshot = state.buffer.length
        ? state.buffer[state.buffer.length - 1].snapshot
        : null;

      const alert = await createAlertRecord({
        userID: 1,
        alert_type,
        content,
        initial_snapshot_url: null,
      });
      // if we have an immediate snapshot, save it
      if (initialSnapshot) {
        await snapshotService.saveBase64Snapshot(
          initialSnapshot,
          alert.alertID
        );
        try {
          await snapshotService.saveBase64Snapshot(
            initialSnapshot,
            alert.alertID
          );
        } catch (sErr) {
          console.error("[alertManager] saveBase64Snapshot error:", sErr);
        }
      }

      // mark state as collecting
      state.lastTriggerAt = Date.now();
      state.collectingSnapshots = true;
      state.alertID = alert.alertID;

      // instruct caller to POST snapshots to /api/alerts/:id/snapshot
      return res
        .status(201)
        .json({ message: "Alert triggered", alertID: alert.alertID });
    }

    // fall rule: require 2 consecutive FALL labels
    const last = state.buffer.slice(-FALL_CONSECUTIVE);
    if (
      last.length === FALL_CONSECUTIVE &&
      last.every((x) => x.label === "FALL")
    ) {
      console.log("[alertManager] fall candidate (consecutive)");
      const alert_type = "fall";
      const content = JSON.stringify({
        from: source,
        bufferCount: state.buffer.length,
      });
      const initialSnapshot = state.buffer.length
        ? state.buffer[state.buffer.length - 1].snapshot
        : null;

      const alert = await createAlertRecord({
        userID: 1,
        alert_type,
        content,
        initial_snapshot_url: null,
      });
      if (initialSnapshot) {
        await snapshotService.saveBase64Snapshot(
          initialSnapshot,
          alert.alertID
        );
        try {
          await snapshotService.saveBase64Snapshot(
            initialSnapshot,
            alert.alertID
          );
        } catch (sErr) {
          console.error("[alertManager] saveBase64Snapshot error:", sErr);
        }
      }

      state.lastTriggerAt = Date.now();
      state.collectingSnapshots = true;
      state.alertID = alert.alertID;

      return res
        .status(201)
        .json({ message: "Fall triggered", alertID: alert.alertID });
    }

    return res.json({ ok: true, message: "No trigger" });
  } catch (err) {
    console.error("handleDetectionEvent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default { handleDetectionEvent };
