import { supabase } from "../lib/supabaseClient";

export async function logUserActivity(user_id, event, description = "") {
  try {
    // 1️⃣ Get user's public IP
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();

    // 2️⃣ Get location data
    const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const locationData = await locRes.json();

    // Extract details to match your table columns
    const city = locationData?.city || "Unknown";
    const region = locationData?.region || "Unknown";
    const country = locationData?.country_name || "Unknown";

    // 3️⃣ Insert into Supabase
    const { error } = await supabase.from("user_activity").insert([
      {
        user_id,
        event,
        description,
        ip,
        city,
        region,
        country,
      },
    ]);

    if (error) console.error("Failed to log user activity:", error.message);
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
}
