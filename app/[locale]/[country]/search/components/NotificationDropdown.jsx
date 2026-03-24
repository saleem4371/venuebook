export default function NotificationDropdown() {

const notifications = [
{ id: 1, text: "New booking request received" },
{ id: 2, text: "Your venue was approved" },
{ id: 3, text: "New review posted" },
];

return (

<div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg p-4">

  <h3 className="font-semibold mb-3">
    Notifications
  </h3>

  {notifications.map((n) => (
    <div
      key={n.id}
      className="text-sm py-2 border-b last:border-none"
    >
      {n.text}
    </div>
  ))}

</div>
);
}
