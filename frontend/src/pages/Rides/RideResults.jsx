import Button from "../../components/Button";

export default function RideResults({ items = [], onBook }) {
  if (!items.length) return null;
  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-lg font-semibold">Available Rides</h3>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r._id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.from} → {r.to}</div>
              <div className="text-sm text-gray-600">
                Date: {r.date} • Seats left: {Math.max(0, r.availableSeats - (r.confirmedSeats||0))}
              </div>
              <div className="text-sm font-semibold mt-1">₹{r.price}</div>
            </div>
            <Button onClick={() => onBook(r)} disabled={(r.confirmedSeats||0) >= r.availableSeats}>
              Book
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
