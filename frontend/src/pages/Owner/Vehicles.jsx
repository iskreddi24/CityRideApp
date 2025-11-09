import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Button from "../../components/Button";

export default function Vehicles({ toast }) {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ model: "", plate: "", type: "Car" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/vehicles/my");
      setVehicles(data || []);
    } catch {
      toast("Failed to load vehicles", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.model || !form.plate) return toast("Fill all fields", "error");
    setLoading(true);
    try {
      await api.post("/vehicles", form);
      toast("Vehicle registered", "success");
      setForm({ model: "", plate: "", type: "Car" });
      load();
    } catch (e) {
      toast(e?.response?.data?.error || "Failed to register", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id) => {
    await api.delete(`/vehicles/${id}`);
    toast("Vehicle deleted", "success");
    load();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Register Vehicle</h2>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <input
            className="border p-2 rounded"
            placeholder="Vehicle Model"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Plate Number"
            value={form.plate}
            onChange={(e) => setForm({ ...form, plate: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Auto">Auto</option>
          </select>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Register"}
          </Button>
        </form>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">My Vehicles</h2>
        {vehicles.length ? (
          vehicles.map((v) => (
            <div
              key={v._id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                {v.model} ({v.plate}) — <b>{v.status}</b>
              </div>
              {["Pending", "Rejected"].includes(v.status) && (
                <Button onClick={() => deleteVehicle(v._id)}>Delete</Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No vehicles registered yet.</p>
        )}
      </div>
    </div>
  );
}
