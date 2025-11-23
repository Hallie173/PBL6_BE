import fs from "fs";
import path from "path";

export default {
  saveBase64Snapshot(base64, alertID) {
    try {
      const buffer = Buffer.from(base64, "base64");

      const filePath = `uploads/snapshot_${alertID}_${Date.now()}.jpg`;
      fs.writeFileSync(filePath, buffer);

      return { publicPath: filePath };
    } catch (err) {
      console.error(err);
      return null;
    }
  },
};
