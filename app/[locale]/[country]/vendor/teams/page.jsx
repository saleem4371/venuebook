"use client";

import { useState } from "react";
import GlobalModal from "../components/GlobalModal";
import { Pencil, Trash2, Loader2 } from "lucide-react";

const modules = [
  "Dashboard",
  "Bookings",
  "Calendar",
  "Packages",
  "Addons",
  "Venues",
  "Users",
];

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState("All");
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState(["Admin", "Manager", "Staff"]);
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");

  const users = [
    { name: "John Doe", email: "john@mail.com", phone: "9876543210", role: "Admin" },
    { name: "Rahul", email: "rahul@mail.com", phone: "9999999999", role: "Manager" },
  ];

  const filtered =
    roleFilter === "All"
      ? users
      : users.filter((u) => u.role === roleFilter);

  /* 🔥 ADD ROLE */
  const handleAddRole = () => {
    if (!newRole.trim()) {
      setError("Role name required");
      return;
    }
    setError("");
    setRoles([...roles, newRole]);
    setNewRole("");
  };

  /* 🔥 DELETE ROLE */
  const deleteRole = (role) => {
    if (confirm(`Delete ${role}?`)) {
      setRoles(roles.filter((r) => r !== role));
    }
  };

  /* 🔥 SAVE USER */
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpenUserModal(false);
    }, 1200);
  };

  return (
    <div className="p-4 md:p-6 pb-24">

      {/* 🔝 HEADER */}
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>

        {/* ROLE FILTER */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...roles].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap cursor-pointer
                ${roleFilter === r
                  ? "bg-indigo-600 text-white"
                  : "bg-white/60 backdrop-blur border border-gray-200"
                }`}
            >
              {r}
            </button>
          ))}
        </div>

      {/* ACTION BUTTONS */}
<div className="flex gap-3 w-full md:w-auto">
  
  <button
    onClick={() => setOpenRoleModal(true)}
    className="
      w-1/2 md:w-auto 
      px-4 py-2 
      bg-green-800 text-white 
      rounded-xl text-sm 
      flex items-center justify-center gap-2
      transition-all duration-200
      hover:bg-green-700 hover:scale-105
      active:scale-95
      shadow-sm hover:shadow-md
      cursor-pointer
    "
  >
    ⚙️ Roles
  </button>

  <button
    onClick={() => setOpenUserModal(true)}
    className="
      w-1/2 md:w-auto 
      px-4 py-2 
      bg-blue-800 text-white 
      rounded-xl text-sm 
      flex items-center justify-center gap-2
      transition-all duration-200
      hover:bg-blue-700 hover:scale-105
      active:scale-95
      shadow-sm hover:shadow-md
      cursor-pointer
    "
  >
    ➕ Add User
  </button>

</div>


      </div>

      {/* 🖥 DESKTOP TABLE */}
      <div className="hidden md:block bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-5 p-4 text-sm text-gray-500 border-b">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Role</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.map((u, i) => (
          <div key={i} className="grid grid-cols-5 p-4 border-b items-center">
            <span>{u.name}</span>
            <span>{u.email}</span>
            <span>{u.phone}</span>
            <span className="text-indigo-600">{u.role}</span>

            <div className="flex justify-end gap-3">
              <button onClick={() => setOpenUserModal(true)} className="icon-btn-blue">
                <Pencil size={16} />
              </button>

              <button onClick={() => confirm("Delete user?")} className="icon-btn-red">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 📱 MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filtered.map((u, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl border rounded-2xl p-4 shadow">
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold">{u.name}</h2>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="text-sm text-gray-500">{u.phone}</p>
              </div>

              <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                {u.role}
              </span>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setOpenUserModal(true)} className="icon-btn-blue">
                <Pencil size={18} />
              </button>

              <button onClick={() => confirm("Delete user?")} className="icon-btn-red">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 👤 USER MODAL */}
      <GlobalModal open={openUserModal} onClose={() => setOpenUserModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Add User</h2>

        <Input placeholder="Name" />
        <Input placeholder="Email" />
        <Input placeholder="Phone" />
        <Select options={roles} />

        <button
          onClick={handleSave}
          className="w-full p-2 bg-green-800 text-white rounded-xl flex justify-center items-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Save"}
        </button>
      </GlobalModal>

      {/* 🔐 ROLE MODAL */}
      <GlobalModal open={openRoleModal} onClose={() => setOpenRoleModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Roles & Permissions</h2>

        <div className="flex gap-2 mb-2">
          <Input
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Role name"
          />
          <button onClick={handleAddRole} className="p-2 bg-green-800 text-white rounded-xl cursor-pointer">
            Add
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* ROLE LIST */}
        <div className="space-y-2 my-4 max-h-40 overflow-auto">
          {roles.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-white/70 p-2 rounded-xl">
              <span>{r}</span>

              <div className="flex gap-2">
                <button className="text-blue-600 cursor-pointer">
                  <Pencil size={16} />
                </button>

                <button onClick={() => deleteRole(r)} className="text-red-600 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PERMISSIONS */}
        <div className="overflow-auto text-sm">
          <div className="grid grid-cols-5 font-semibold mb-2">
            <span>Module</span>
            <span>C</span>
            <span>E</span>
            <span>V</span>
            <span>D</span>
          </div>

          {modules.map((m) => (
            <div key={m} className="grid grid-cols-5 py-2 items-center">
              <span>{m}</span>
              {[1, 2, 3, 4].map((_, i) => (
                <input key={i} type="checkbox" className="accent-indigo-600 cursor-pointer" />
              ))}
            </div>
          ))}
        </div>

        <button className="w-full mt-4 p-2 bg-green-800 text-white rounded-xl cursor-pointer">
          Save Role
        </button>
      </GlobalModal>

      {/* ➕ FLOAT BUTTON */}
      <button
        onClick={() => setOpenUserModal(true)}
        className="md:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg cursor-pointer"
      >
        +
      </button>
    </div>
  );
}

/* 🔥 COMPONENTS */

function Input(props) {
  return (
    <input
      {...props}
      className="w-full mb-3 px-4 py-2 rounded-xl bg-white/70 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  );
}

function Select({ options }) {
  return (
    <select className="w-full mb-3 px-4 py-2 rounded-xl bg-white/70 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
