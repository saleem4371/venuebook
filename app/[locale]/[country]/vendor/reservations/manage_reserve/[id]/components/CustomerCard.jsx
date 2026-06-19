export default function CustomerCard({
  data,
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h3 className="font-semibold mb-6">
        Customer Details
      </h3>

      <div className="grid grid-cols-2 gap-y-4">
        <div>Name</div>
        <div>{data.name}</div>

        <div>Email</div>
        <div>{data.email}</div>

        <div>Phone</div>
        <div>{data.phone}</div>

        <div>Address</div>
        <div>{data.address}</div>
      </div>
    </div>
  );
}