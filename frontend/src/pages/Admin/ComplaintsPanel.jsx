import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Button from "../../components/Button";
import "../../styles/admin.css";

export default function ComplaintsPanel({ toast }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/complaints", {
        params: filter === "All" ? {} : { status: filter },
      });
      setComplaints(data || []);
    } catch {
      toast("Failed to load complaints", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.post("/admin/complaints/update", { complaintId: id, status });
      toast(`Complaint marked ${status}`, "success");
      loadComplaints();
    } catch {
      toast("Failed to update complaint", "error");
    }
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Complaints Management</h2>
        <div className="flex gap-2">
          {["All", "Pending", "In Review", "Resolved"].map((s) => (
            <Button
              key={s}
              className={filter === s ? "primary" : "secondary"}
              onClick={() => setFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length ? (
        complaints.map((c) => (
          <div
            key={c._id}
            className="border rounded p-3 flex justify-between items-start"
          >
            <div>
              <div>
                <b>{c.subject || "No Subject"}</b> —{" "}
                <span className="text-sm text-gray-600">{c.status}</span>
              </div>
              <div className="text-sm mt-1">{c.message}</div>
              <div className="text-xs text-gray-500 mt-1">
                From: {c.userId?.email} | {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {c.status !== "In Review" && (
                <Button
                  className="secondary"
                  onClick={() => updateStatus(c._id, "In Review")}
                >
                  In Review
                </Button>
              )}
              {c.status !== "Resolved" && (
                <Button
                  onClick={() => updateStatus(c._id, "Resolved")}
                >
                  Resolve
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No complaints found</p>
      )}
    </div>
  );
}
