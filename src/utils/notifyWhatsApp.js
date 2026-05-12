import { twilioClient } from "../config/twilio.js";
import dotenv from "dotenv";

dotenv.config();

export const notifyWhatsApp = async (lead) => {
  try {
    const message = `
🔥 *New Lead — NexaBot Agency!*

👤 Name: ${lead.name || "Not provided"}
📱 Phone: ${lead.phone || "Not provided"}
🏢 Business: ${lead.business_type || "Not provided"}
📋 Requirement: ${lead.requirement || "Not provided"}
⏰ Time: ${new Date().toLocaleString("en-IN")}

Reply karo jaldi! 🚀
    `.trim();

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
      body: message,
    });

    console.log("✅ WhatsApp notification sent!");
  } catch (error) {
    console.error("WhatsApp notification error:", error.message);
  }
};

export const notifyFrustration = async (sessionId, message) => {
  try {
    const alert = `
⚠️ *Frustrated Visitor Alert!*

🆔 Session: ${sessionId}
💬 Message: "${message}"
⏰ Time: ${new Date().toLocaleString("en-IN")}

Jaldi respond karo! 🚀
    `.trim();

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
      body: alert,
    });

    console.log("⚠️ Frustration alert sent!");
  } catch (error) {
    console.error("Frustration alert error:", error.message);
  }
};
