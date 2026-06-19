"use client";

import {
  Calendar,
  MapPin,
  User,
} from "lucide-react";

export default function BookingHeader({ data }) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="grid grid-cols-6 gap-6 items-center">
        <Info
          title="BOOKING ID"
          value={data.bookingId}
        />

        <Info
          title="CUSTOMER"
          value={data.customer.name}
          icon={<User size={18} />}
        />

        <Info
          title="VENUE"
          value={data.venue}
          icon={<MapPin size={18} />}
        />

        <Info
          title="EVENT DATE"
          value={data.eventDate}
          icon={<Calendar size={18} />}
        />

        <div>
          <p className="text-xs text-slate-500">
            STATUS
          </p>

          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
            Confirmed
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            TOTAL AMOUNT
          </p>

          <h2 className="text-3xl font-bold text-violet-600">
            ₹41,299
          </h2>

          <p className="text-green-600 text-sm">
            Paid ₹30,299
          </p>
        </div>
      </div>
    </div>
  );
}

function Info({
  title,
  value,
  icon,
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <div className="flex items-center gap-2 mt-1">
        {icon}

        <span className="font-semibold">
          {value}
        </span>
      </div>
    </div>
  );
}