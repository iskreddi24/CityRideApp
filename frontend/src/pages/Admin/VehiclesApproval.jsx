import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Button from "../../components/Button";
import "../../styles/admin.css";

export default function VehiclesApproval({ toast }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/vehicles/pending");
      setList(data || []);
    } catch (err) {
      toast("Failed to load pending vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (vehicleId, status) => {
    try {
      await api.post("/admin/vehicles/review", { vehicleId, status });
      toast(`Vehicle ${status}`, "success");
      setList((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch {
      toast("Failed to update vehicle status", "error");
    }
  };

  if (loading) return <div className="p-4">Loading vehicles...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Pending Vehicle Approvals</h2>
      {list.length === 0 ? (
        <div className="text-gray-500">No pending vehicles 🎉</div>
      ) : (
        <div className="grid gap-3">
          {list.map((v) => (
            <div
              key={v._id}
              className="border rounded p-4 flex flex-col md:flex-row justify-between gap-3"
            >
              <div>
                <div>
                  <b>{v.model}</b> ({v.plate}) — {v.type}
                </div>
                <div className="text-sm text-gray-600">
                  Owner ID: {v.ownerId}
                </div>
                <div className="mt-2 space-x-3 text-sm">
                  {v.rcDocUrl && (
                    <a
                      href={v.rcDocUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      RC Doc
                    </a>
                  )}
                  {v.insuranceDocUrl && (
                    <a
                      href={v.insuranceDocUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Insurance Doc
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => review(v._id, "Approved")}>
                  Approve
                </Button>
                <Button
                  className="secondary"
                  onClick={() => review(v._id, "Rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
