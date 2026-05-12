import { supabase } from "../config/supabase.js";

export const saveLead = async (sessionId, leadData) => {
  try {
    const { error } = await supabase
      .from("leads")
      .insert([{ session_id: sessionId, ...leadData }]);

    if (error) throw error;
    console.log("✅ Lead saved:", leadData);
  } catch (error) {
    console.error("Lead save error:", error.message);
  }
};
