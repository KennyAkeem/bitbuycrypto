import { supabase } from "../lib/supabaseClient";

/**
 * Fetch paginated user activity.
 * If admin=true, fetches all users; otherwise only the current user's activities.
 */
export async function fetchUserActivities(user_id, page = 1, limit = 10, admin = false) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("user_activity")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!admin) {
      query = query.eq("user_id", user_id);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    return {
      activities: data || [],
      totalPages,
      currentPage: page,
    };
  } catch (err) {
    console.error("Error fetching user activities:", err.message);
    return { activities: [], totalPages: 1, currentPage: 1 };
  }
}

/**
 * Reset (truncate) user_activity table.
 * ⚠️ Only call this as an admin action.
 */
export async function resetUserActivityTable() {
  try {
    const { error } = await supabase.rpc("truncate_user_activity");
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error resetting user activity table:", err.message);
    return false;
  }
}
