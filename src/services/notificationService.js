import nodemailer from "nodemailer";
import sequelize from "../config/database.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function getRecipients() {
  const [rows] = await sequelize.query(
    `SELECT userID, email, display_name 
     FROM Users 
     WHERE email IS NOT NULL`
  );
  return rows;
}

async function notifyAlert(alertInstance, snapshots = []) {
  try {
    const recipients = await getRecipients();
    if (!recipients.length) {
      console.warn("No recipients to notify");
      return;
    }

    const subject = `[ALERT] ${String(
      alertInstance.alert_type
    ).toUpperCase()} detected`;

    const text = `Alert: ${alertInstance.alert_type}
Content: ${alertInstance.content || ""}
Time: ${alertInstance.createdAt}
`;

    // Attach max 3 images
    const attachments = (snapshots || []).slice(0, 3).map((p) => {
      const localPath = p.startsWith("/uploads/") ? `${process.cwd()}${p}` : p;

      return {
        filename: p.split("/").pop(),
        path: localPath,
      };
    });

    for (const r of recipients) {
      const mailOptions = {
        from: process.env.MAIL_USER,
        to: r.email,
        subject,
        text,
        attachments,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${r.email}`);
      } catch (err) {
        console.error("sendMail error for", r.email, err);
      }
    }
  } catch (err) {
    console.error("notifyAlert error:", err);
  }
}

export default {
  notifyAlert,
};
