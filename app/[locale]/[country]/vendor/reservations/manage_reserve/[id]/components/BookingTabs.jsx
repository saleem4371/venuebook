export default function BookingTabs({ active, setActive }) {
  const tabs = ["Overview", "Payment", "Refund", "Documents"];

  return (
    <div className="glass p-2 flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            active === tab
              ? "bg-black text-white"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}