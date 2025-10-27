import { useEffect, useState } from "react";
import { fetchUserActivities, resetUserActivityTable } from "../utils/userActivity";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

export default function AdminActivityLogs() {
  const { user } = useUser();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadActivities(p = 1) {
    if (!user) return;
    setLoading(true);
    const res = await fetchUserActivities(user.id, p, 10, true); // admin=true
    setActivities(res.activities);
    setTotalPages(res.totalPages);
    setPage(res.currentPage);
    setLoading(false);
  }

  useEffect(() => {
    loadActivities(1);
  }, [user]);

  async function handleReset() {
    if (!confirm("⚠️ Are you sure you want to clear all activity logs?")) return;
    await resetUserActivityTable();
    await loadActivities(1);
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">User Activity Logs</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
        >
          Reset Logs
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-6">Loading activities...</p>
      ) : activities.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No activity logs found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">User ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Event</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">IP</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act, i) => (
                <motion.tr
                  key={i}
                  className="border-t hover:bg-blue-50 transition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <td className="py-2 px-4 text-xs font-medium text-gray-700">{act.user_id}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{act.event}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">{act.description}</td>
                  <td className="py-2 px-4 text-xs text-gray-500">{act.ip}</td>
                  <td className="py-2 px-4 text-xs text-gray-500">
                    {act.city}, {act.region}, {act.country}
                  </td>
                  <td className="py-2 px-4 text-xs text-gray-400">
                    {new Date(act.created_at).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => loadActivities(page - 1)}
            disabled={page <= 1}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            ◀ Prev
          </button>
          <span className="text-sm text-gray-600">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => loadActivities(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
