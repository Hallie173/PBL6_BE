import { Alert, AlertRecipient } from "../models/index.js";
import snapshotService from "../services/snapshotService.js";

export async function createAlertRecord({ userID, alert_type, content }) {
  const alert = await Alert.create({
    userID,
    alert_type,
    content,
    initial_snapshot_url: null,
  });

  // tạo danh sách recipient cho alert
  const recipients = await AlertRecipient.findAll();
  console.log("Recipients fetched:", recipients.length);

  for (const r of recipients) {
    await r.update({ alertID: alert.alertID });
  }

  return alert;
}

export async function receiveAlert(req, res) {
  try {
    const { alert_type, content } = req.body;

    if (!alert_type) {
      return res.status(400).json({ message: "alert_type missing" });
    }

    const alert = await createAlertRecord({
      userID: req.body.userID || 1,
      alert_type: alert_type.toLowerCase(),
      content: content || "",
    });

    return res.status(201).json({ ok: true, alertID: alert.alertID });
  } catch (err) {
    console.error("receiveAlert error:", err);
    res.status(500).json({ message: "fail" });
  }
}

export async function uploadSnapshot(req, res) {
  const alertID = req.params.id;

  if (!req.body.snapshot)
    return res.status(400).json({ message: "snapshot required" });

  const result = await snapshotService.saveBase64Snapshot(
    req.body.snapshot,
    alertID
  );

  if (!result) return res.status(500).json({ message: "save failed" });

  res.json({ ok: true, path: result.publicPath });
}

export async function getAlert(req, res) {
  const alert = await Alert.findByPk(req.params.id);
  if (!alert) return res.status(404).json({ message: "not found" });
  res.json(alert);
}

export default {
  receiveAlert,
  createAlertRecord,
  uploadSnapshot,
  getAlert,
};
