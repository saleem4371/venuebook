export default function ActionButtons({ actions }) {
  return (
    <div className="glass p-4 flex gap-2 flex-wrap">
      {actions.map((a) => (
        <button
          key={a.key}
          // onClick={a.onClick}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            a.danger
              ? "bg-red-500 text-white"
              : "bg-black text-white"
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}