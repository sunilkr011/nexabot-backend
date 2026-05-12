// Abuse words list
const ABUSE_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "chutiya",
  "madarchod",
  "behenchod",
  "gandu",
  "harami",
  "sala",
  "bakwas",
  "nonsense",
];

export const detectAbuse = (text) => {
  const lower = text.toLowerCase();

  return ABUSE_WORDS.some((word) => lower.includes(word));
};

// Frustration words list
const FRUSTRATION_WORDS = [
  // English
  "useless",
  "not helpful",
  "waste",
  "stupid",
  "worst",
  "terrible",
  "awful",
  "horrible",
  "pathetic",
  "garbage",
  "not working",
  "doesnt work",
  "doesn't work",
  "broken",
  "disappointed",
  "frustrating",
  "annoying",
  "ridiculous",

  // Hinglish
  "bakwas",
  "bekar",
  "faltu",
  "kaam nahi",
  "kuch nahi",
  "bekaar",
  "wahiyat",
  "nonsense",
  "kachra",
  "bewakoof",
  "time waste",
  "chutiyapa",
  "pagalpan",
];

export const detectFrustration = (text) => {
  const lower = text.toLowerCase();

  return FRUSTRATION_WORDS.some((word) => lower.includes(word));
};

export const detectLead = (text) => {
  try {
    const match = text.match(/LEAD_CAPTURED:(\{.*?\})/);

    if (match) {
      const lead = JSON.parse(match[1]);

      // Clean reply — LEAD_CAPTURED part hata do
      const cleanReply = text.replace(/LEAD_CAPTURED:\{.*?\}/, "").trim();

      return { lead, cleanReply };
    }

    return { lead: null, cleanReply: text };
  } catch {
    return { lead: null, cleanReply: text };
  }
};
