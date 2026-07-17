import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Paths for persistent files
const SETTINGS_FILE = path.join(process.cwd(), "system_settings.json");
const NOTIFICATIONS_FILE = path.join(process.cwd(), "email_notifications.json");
const SYNCED_TASKS_FILE = path.join(process.cwd(), "server_tasks.json");
const SYNCED_OFFICERS_FILE = path.join(process.cwd(), "server_officers.json");

// Default system configurations
const DEFAULT_SETTINGS = {
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpServer: "smtp.gmail.com",
  smtpPort: 587,
  smtpEncryption: "TLS",
  alertEmails: ["d31a.baopham1505@gmail.com"],
};

// Helper: load/save JSON files safely
function loadJSON(filePath: string, defaultData: any) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultData;
}

function saveJSON(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Vietnam date formatter (UTC+7)
function getVietnamTodayStr() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));
  const yyyy = vnTime.getFullYear();
  const mm = String(vnTime.getMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Days diff: deadlineDate - todayDate
function getDaysDiff(deadlineStr: string, todayStr: string) {
  try {
    const d1 = new Date(deadlineStr);
    const d2 = new Date(todayStr);
    d1.setHours(12, 0, 0, 0);
    d2.setHours(12, 0, 0, 0);
    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (err) {
    console.error(`Error parsing dates: ${deadlineStr}, ${todayStr}`, err);
    return NaN;
  }
}

// CORE NOTIFICATION LOGIC
async function runNotificationCheck() {
  console.log(`[Notification Engine] Starting automated check at ${new Date().toISOString()}`);
  
  const settings = loadJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
  const tasks = loadJSON(SYNCED_TASKS_FILE, []);
  const officers = loadJSON(SYNCED_OFFICERS_FILE, []);
  const notificationsLog = loadJSON(NOTIFICATIONS_FILE, []);
  
  const todayStr = getVietnamTodayStr();
  const results = { sent: 0, skipped: 0, errors: 0, logs: [] as string[] };
  
  if (!tasks || tasks.length === 0) {
    results.logs.push("No tasks synced yet to evaluate.");
    console.log("[Notification Engine] No tasks found to process.");
    return results;
  }

  const baseAppUrl = process.env.APP_URL || "http://localhost:3000";

  for (const task of tasks) {
    if (task.status === "Hoàn thành") {
      continue;
    }

    const diffDays = getDaysDiff(task.deadline, todayStr);
    if (isNaN(diffDays)) continue;

    let milestone: "3_DAYS_BEFORE" | "DUE_TODAY" | "OVERDUE" | null = null;
    let subject = "";
    let statusDesc = "";

    if (diffDays === 3) {
      milestone = "3_DAYS_BEFORE";
      subject = `[PCCC] Nhắc việc sắp đến hạn: ${task.title}`;
      statusDesc = "Còn 3 ngày đến hạn";
    } else if (diffDays === 0) {
      milestone = "DUE_TODAY";
      subject = `[PCCC] Công việc đến hạn hôm nay: ${task.title}`;
      statusDesc = "Đến hạn hôm nay";
    } else if (diffDays < 0) {
      milestone = "OVERDUE";
      subject = `[PCCC] CẢNH BÁO QUÁ HẠN: ${task.title}`;
      statusDesc = `Đã quá hạn ${Math.abs(diffDays)} ngày`;
    }

    if (!milestone) continue;

    const recipients = settings.alertEmails || ["d31a.baopham1505@gmail.com"];
    
    // Find assignee full name
    const assignee = officers.find((o: any) => o.id === task.assigneeId);
    const assigneeName = assignee ? `${assignee.rank} ${assignee.fullName}` : task.assigneeId || "Chưa phân công";

    for (const email of recipients) {
      if (!email || !email.includes("@")) continue;

      // Check if we already sent this milestone to this email successfully
      const alreadySent = notificationsLog.some(
        (log: any) =>
          log.task_id === task.id &&
          log.email === email &&
          log.notification_type === milestone &&
          log.status === "success"
      );

      if (alreadySent) {
        results.skipped++;
        continue;
      }

      // Build email HTML body matching Vietnamese specifications
      const directUrl = `${baseAppUrl}/?taskId=${task.id}`;
      const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #dc2626; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">CẢNH BÁO HỆ THỐNG PCCC & CNCH</h2>
          </div>
          <div style="padding: 24px; background-color: #ffffff; color: #334155;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Kính gửi Cán bộ chiến sĩ phụ trách,</p>
            <p style="font-size: 14px; line-height: 1.6;">Hệ thống thông báo nhắc việc tự động ghi nhận trạng thái mới của công việc như sau:</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 140px;">Tên công việc:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #1e293b;">${task.title}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Mã công việc:</td>
                  <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${task.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Ngày tạo:</td>
                  <td style="padding: 6px 0;">${task.startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Ngày đến hạn:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #dc2626;">${task.deadline}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Trạng thái:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #b91c1c; text-transform: uppercase;">${statusDesc}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Người phụ trách:</td>
                  <td style="padding: 6px 0; font-weight: bold;">${assigneeName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Mức độ ưu tiên:</td>
                  <td style="padding: 6px 0;"><span style="background-color: ${task.priority === 'Cao' ? '#fee2e2' : task.priority === 'Trung bình' ? '#fef3c7' : '#f0fdf4'}; color: ${task.priority === 'Cao' ? '#991b1b' : task.priority === 'Trung bình' ? '#92400e' : '#166534'}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">${task.priority}</span></td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 26px; margin-bottom: 10px;">
              <a href="${directUrl}" target="_blank" style="display: inline-block; background-color: #dc2626; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; font-size: 14px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2); transition: background-color 0.2s;">Truy Cập Xử Lý Công Việc</a>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">Đây là thư nhắc việc tự động gửi từ hệ thống quản lý PCCC & CNCH. Vui lòng không trả lời thư này.</p>
          </div>
        </div>
      `;

      // Trigger actual email sending
      try {
        if (!settings.smtpUser || !settings.smtpPass) {
          throw new Error("SMTP credentials are not configured in system settings.");
        }

        const transporter = nodemailer.createTransport({
          host: settings.smtpServer,
          port: Number(settings.smtpPort),
          secure: Number(settings.smtpPort) === 465, // TLS
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter.sendMail({
          from: `"Hệ thống PCCC & CNCH" <${settings.smtpUser}>`,
          to: email,
          subject: subject,
          html: htmlBody,
        });

        results.sent++;
        notificationsLog.push({
          id: `EMAIL_LOG_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          task_id: task.id,
          email: email,
          notification_type: milestone,
          sent_at: new Date().toISOString(),
          status: "success",
        });

        results.logs.push(`Email successfully sent to ${email} for task ${task.id}`);
      } catch (err: any) {
        results.errors++;
        notificationsLog.push({
          id: `EMAIL_LOG_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          task_id: task.id,
          email: email,
          notification_type: milestone,
          sent_at: new Date().toISOString(),
          status: "error",
          error_message: err.message || String(err),
        });
        results.logs.push(`Failed to send email to ${email} for task ${task.id}: ${err.message}`);
        console.error(`Error sending email to ${email} for task ${task.id}:`, err);
      }
    }
  }

  saveJSON(NOTIFICATIONS_FILE, notificationsLog);
  return results;
}

// Set up periodic 1-hour intervals
setInterval(() => {
  runNotificationCheck().catch(err => console.error("Error in scheduled notification check:", err));
}, 1 * 60 * 60 * 1000); // 1 Hour

// API ENDPOINTS

// 1. Sync tasks and officers from client
app.post("/api/sync-tasks", (req, res) => {
  const { tasks, officers } = req.body;
  if (Array.isArray(tasks)) {
    saveJSON(SYNCED_TASKS_FILE, tasks);
  }
  if (Array.isArray(officers)) {
    saveJSON(SYNCED_OFFICERS_FILE, officers);
  }
  res.json({ success: true, message: "Tasks and officers synchronized successfully on backend!" });
});

// 2. Read System settings
app.get("/api/settings", (req, res) => {
  const settings = loadJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
  res.json(settings);
});

// 3. Update System settings
app.post("/api/settings", (req, res) => {
  const settings = loadJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
  const updated = { ...settings, ...req.body };
  saveJSON(SETTINGS_FILE, updated);
  res.json({ success: true, settings: updated });
});

// 4. Read Email notification log
app.get("/api/email-notifications", (req, res) => {
  const logs = loadJSON(NOTIFICATIONS_FILE, []);
  res.json(logs);
});

// 5. Trigger automated notification check manually
app.post("/api/trigger-check", async (req, res) => {
  try {
    const results = await runNotificationCheck();
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// VITE MIDDLEWARE FOR DEVELOPMENT AND PRODUCTION SERVING
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 System server running on http://0.0.0.0:${PORT}`);
    
    // Initial dry-run or verification when server starts
    runNotificationCheck()
      .then(res => console.log(`[Notification Engine] Initialized and ran dry check. Sent: ${res.sent}, Skipped: ${res.skipped}, Errors: ${res.errors}`))
      .catch(err => console.error("[Notification Engine] Initial check failed:", err));
  });
}

startServer();
