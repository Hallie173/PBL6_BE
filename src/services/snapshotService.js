import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads", "alerts");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveBase64Snapshot(base64Data, alertID = null) {
  try {
    let raw = base64Data;
    if (raw.startsWith("data:")) raw = raw.split(",")[1];

    const buffer = Buffer.from(raw, "base64");
    const folderName = alertID ? String(alertID) : "tmp";
    const dir = path.join(UPLOADS_ROOT, folderName);
    ensureDir(dir);

    const filename = `${Date.now()}_${uuidv4()}.jpg`;
    const filepath = path.join(dir, filename);
    await fs.promises.writeFile(filepath, buffer);

    const publicPath = `/uploads/alerts/${folderName}/${filename}`;
    return { filepath, publicPath };
  } catch (err) {
    console.error("saveBase64Snapshot error:", err);
    return null;
  }
}

export default {
  saveBase64Snapshot,
};
