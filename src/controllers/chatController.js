import { notifyWhatsApp, notifyFrustration } from "../utils/notifyWhatsApp.js";

import { groqClient, GROQ_MODEL } from "../config/gemini.js";
import { supabase } from "../config/supabase.js";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt.js";

import {
  detectLead,
  detectAbuse,
  detectFrustration,
} from "../utils/detectLead.js";

import { saveLead } from "./leadController.js";

// Language detect karo
const detectLanguage = (text) => {
  const hindiWords = [
    "mera",
    "meri",
    "mere",
    "hai",
    "hain",
    "kya",
    "nahi",
    "nhi",
    "aur",
    "mujhe",
    "chahiye",
    "karo",
    "kar",
    "ho",
    "ye",
    "yeh",
    "woh",
    "wo",
    "tha",
    "thi",
    "the",
    "se",
    "pe",
    "par",
    "ko",
    "ka",
    "ki",
    "ke",
    "ek",
    "bhi",
    "toh",
    "to",
    "main",
    "mai",
    "hum",
    "aap",
    "ap",
    "koi",
    "kuch",
    "sab",
    "bahut",
    "bahot",
    "accha",
    "acha",
    "theek",
    "thik",
    "namaste",
    "bhai",
    "yaar",
  ];

  const words = text.toLowerCase().split(/\s+/);

  const hindiCount = words.filter((w) => hindiWords.includes(w)).length;

  return hindiCount >= 1 ? "hinglish" : "english";
};

export const getHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const { data: history } = await supabase
      .from("conversations")
      .select("role, message")
      .eq("session_id", sessionId)
      .order("created_at", {
        ascending: true,
      })
      .limit(30);

    if (!history || history.length === 0) {
      return res.json({ messages: [] });
    }

    // Naam aur business extract karo
    const userMessages = history
      .filter((h) => h.role === "user")
      .map((h) => h.message)
      .join(" ");

    const nameMatch = userMessages.match(
      /(?:my name is|naam hai|main hun|i am)\s+([a-zA-Z]+)/i,
    );

    const businessKeywords = {
      restaurant: ["restaurant", "hotel", "cafe"],
      salon: ["salon", "parlour", "beauty"],
      clinic: ["clinic", "doctor", "hospital"],
      ecommerce: ["shop", "store", "ecommerce"],
      coaching: ["coaching", "classes", "tuition"],
    };

    let businessType = null;

    for (const [type, keywords] of Object.entries(businessKeywords)) {
      if (keywords.some((k) => userMessages.toLowerCase().includes(k))) {
        businessType = type;
        break;
      }
    }

    res.json({
      messages: history,
      visitorName: nameMatch ? nameMatch[1] : null,
      businessType,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: "Message aur sessionId dono chahiye",
      });
    }

    // Language detect karo
    const language = detectLanguage(message);

    // Abuse check karo
    if (detectAbuse(message)) {
      // Supabase mein save karo
      await supabase.from("conversations").insert([
        {
          session_id: sessionId,
          role: "user",
          message,
        },
        {
          session_id: sessionId,
          role: "bot",
          message:
            "⚠️ Please keep the conversation respectful. I am here to help you with NexaBot services only.",
        },
      ]);

      return res.json({
        reply:
          language === "english"
            ? "⚠️ Please keep the conversation respectful. I am here to help you! 😊"
            : "⚠️ Bhai please respectful raho. Main aapki help karne ke liye hun! 😊",

        sessionId,
        leadCaptured: false,
        language,
        abusive: true,
      });
    }

    // Frustration check karo
    if (detectFrustration(message)) {
      // Alert bhejo
      await notifyFrustration(sessionId, message);

      // Special reply do
      const frustrationReply =
        language === "english"
          ? "I'm sorry you're having a tough time 😔 Let me connect you directly with our team. Someone will reach you within 5 minutes! Can you share your WhatsApp number?"
          : "Samajh sakta hun aapki frustration 😔 Main aapko directly humari team se connect karta hun. 5 minutes mein koi aapko contact karega! Apna WhatsApp number share karein?";

      // Supabase mein save karo
      await supabase.from("conversations").insert([
        {
          session_id: sessionId,
          role: "user",
          message,
        },
        {
          session_id: sessionId,
          role: "bot",
          message: frustrationReply,
        },
      ]);

      return res.json({
        reply: frustrationReply,
        sessionId,
        leadCaptured: false,
        language,
        frustrated: true,
      });
    }

    // Language instruction
    const languageInstruction =
      language === "english"
        ? "IMPORTANT: User is writing in English. You MUST reply in English only. Do not use any Hindi or Hinglish words."
        : "IMPORTANT: User is writing in Hinglish. Reply in Hinglish (Roman Hindi + English mix) only. Do not use Devanagari script.";

    // Supabase se history lo
    const { data: history } = await supabase
      .from("conversations")
      .select("role, message")
      .eq("session_id", sessionId)
      .order("created_at", {
        ascending: true,
      })
      .limit(20);

    // Conversation se context extract karo
    const userMessages = (history || [])
      .filter((h) => h.role === "user")
      .map((h) => h.message)
      .join(" ");

    // Context detect karo
    const nameMatch = userMessages.match(
      /(?:my name is|naam hai|main hun|i am)\s+([a-zA-Z]+)/i,
    );

    const extractedName = nameMatch ? nameMatch[1] : null;

    const businessKeywords = {
      restaurant: ["restaurant", "hotel", "cafe", "dhaba", "food"],

      salon: ["salon", "parlour", "beauty", "spa"],

      clinic: ["clinic", "doctor", "hospital", "medical"],

      ecommerce: ["shop", "store", "ecommerce", "online"],

      coaching: ["coaching", "classes", "tuition", "education"],
    };

    let extractedBusiness = null;

    for (const [type, keywords] of Object.entries(businessKeywords)) {
      if (keywords.some((k) => userMessages.toLowerCase().includes(k))) {
        extractedBusiness = type;
        break;
      }
    }

    // Context instruction banao
    const contextInstruction = `
CURRENT CONVERSATION CONTEXT:
${
  extractedName
    ? `- Visitor ka naam: ${extractedName} — hamesha is naam se bulao`
    : "- Naam abhi nahi pata"
}
${
  extractedBusiness
    ? `- Business type: ${extractedBusiness} — is hisaab se suggest karo`
    : "- Business type abhi nahi pata"
}
- Total messages exchanged: ${(history || []).length}
${
  (history || []).length > 6
    ? "- Visitor kaafi der se baat kar raha hai — lead capture karo abhi"
    : ""
}
`;

    // Messages array
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },

      {
        role: "system",
        content: languageInstruction,
      },

      {
        role: "system",
        content: contextInstruction,
      },

      ...(history || []).map((h) => ({
        role: h.role === "bot" ? "assistant" : "user",

        content: h.message,
      })),

      {
        role: "user",
        content: message,
      },
    ];

    // Groq se reply lo
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const rawReply = completion.choices[0].message.content;

    // Lead detect karo
    const { lead, cleanReply } = detectLead(rawReply);

    // Supabase mein save karo
    await supabase.from("conversations").insert([
      {
        session_id: sessionId,
        role: "user",
        message,
      },

      {
        session_id: sessionId,
        role: "bot",
        message: cleanReply,
      },
    ]);

    // Lead save karo + WhatsApp notify
    if (lead) {
      await saveLead(sessionId, lead);

      await notifyWhatsApp(lead);
    }

    res.json({
      reply: cleanReply,
      sessionId,
      leadCaptured: !!lead,
      language,
    });
  } catch (error) {
    next(error);
  }
};
