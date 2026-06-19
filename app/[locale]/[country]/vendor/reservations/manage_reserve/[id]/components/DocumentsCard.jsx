export default function DocumentsCard({ docs }) {
  return (
    <div className="glass p-5">
      <h2 className="heading">Documents</h2>

      <div className="mt-3 space-y-2">
        {docs.map((d) => (
          <div
            key={d.name}
            className="flex justify-between items-center p-2 rounded-lg bg-gray-50"
          >
            <span className="text-sm">{d.name}</span>
            <button className="text-blue-500 text-xs">View</button>
          </div>
        ))}
      </div>
    </div>
  );
}