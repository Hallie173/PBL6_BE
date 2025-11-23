import { Alert } from "../models/index.js";
import snapshotService from "../services/snapshotService.js";

export const receiveAlert = async (req, res) => {
  console.log("📥 BODY:", req.body);
  console.log("👤 USER:", req.user);

  try {
    const userID = req.user?.userID;
    console.log("🔍 userID:", userID);

    if (!userID) {
      return res.status(400).json({ message: "Missing userID" });
    }

    const { alert_type, content } = req.body;

    console.log("🔍 Create alert with:", { userID, alert_type, content });

    const alert = await Alert.create({
      userID,
      alert_type,
      content,
      snapshot_url: null,
    });

    console.log("✔ CREATED ALERT:", alert);

    res.status(201).json({ ok: true, alertID: alert.alertID });
  } catch (e) {
    console.error("❌ ERROR in receiveAlert:", e);
    res.status(500).json({ message: "Server error", error: e.toString() });
  }
};

export const uploadSnapshot = async (req, res) => {
  const alertID = req.params.id;

  const result = await snapshotService.saveBase64Snapshot(
    req.body.snapshot,
    alertID
  );

  if (!result) return res.status(500).json({ message: "save failed" });

  await Alert.update(
    { snapshot_url: result.publicPath, status: "sent" },
    { where: { alertID } }
  );

  res.json({ ok: true, snapshot: result.publicPath });
};
