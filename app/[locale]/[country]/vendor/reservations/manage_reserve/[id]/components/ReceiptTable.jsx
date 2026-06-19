export default function ReceiptTable({
  receipts,
}) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <div className="p-5 font-semibold">
        Receipt Information
      </div>

      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {(receipts || []).map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.amount}</td>

              <td>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                  Paid
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}