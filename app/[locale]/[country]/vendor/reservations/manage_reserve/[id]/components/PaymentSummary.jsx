export default function PaymentSummary({
  data,
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h3 className="font-semibold mb-5">
        Payment Summary
      </h3>

      <div className="space-y-3">
        <Row
          label="Base Price"
          value="₹34,999"
        />

        <Row
          label="GST"
          value="₹6,300"
        />

        <hr />

        <Row
          label="Total"
          value="₹41,299"
          big
        />
      </div>

      <div className="mt-4 bg-violet-50 border border-violet-200 p-4 rounded-xl">
        Security Deposit ₹41,290
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  big,
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>

      <span
        className={
          big
            ? "text-2xl font-bold text-violet-600"
            : ""
        }
      >
        {value}
      </span>
    </div>
  );
}