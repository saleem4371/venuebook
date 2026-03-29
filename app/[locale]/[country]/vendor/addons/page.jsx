"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Grid,
  List,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import GlobalModal from "../components/GlobalModal";
import { useUI } from "@/context/VendorUIContext";

// SAMPLE DATA
const initialAddons = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Addon ${i + 1}`,
  category: ["Decor", "Food", "Entertainment"][i % 3],
  price: (i + 1) * 1000,
}));

export default function AddonsPage() {
  const [addons, setAddons] = useState(initialAddons);
  const [view, setView] = useState("grid");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [search, setSearch] = useState("");

  const { setIsModalOpen } = useUI();

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    preview: "",
  });

  const [categories, setCategories] = useState([
    "Decor",
    "Food",
    "Entertainment",
  ]);
  const [newCategory, setNewCategory] = useState("");

  // 👉 CONTROL GLOBAL UI (hide FAB + bottom dock)
  useEffect(() => {
    setIsModalOpen(open || !!deleteItem);
  }, [open, deleteItem]);

  // PAGINATION
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    return addons.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [addons, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // VALIDATION
  const validate = () => {
    if (!form.name) return "Name required";
    if (!form.category) return "Category required";
    if (!form.price) return "Price required";
  };

  // SAVE
  const handleSave = () => {
    const err = validate();
    if (err) return toast.error(err);

    if (editItem) {
      setAddons((prev) =>
        prev.map((a) => (a.id === editItem.id ? { ...a, ...form } : a))
      );
      toast.success("Updated ✨");
    } else {
      setAddons([...addons, { id: Date.now(), ...form }]);
      toast.success("Added 🚀");
    }

    setOpen(false);
    setEditItem(null);
    setForm({ name: "", category: "", price: "", preview: "" });
  };

  // DELETE
  const handleDelete = () => {
    setAddons(addons.filter((a) => a.id !== deleteItem.id));
    toast.success("Deleted ❌");
    setDeleteItem(null);
  };

  // CATEGORY ADD
  const handleAddCategory = () => {
    const value = newCategory.trim();
    if (!value) return toast.error("Enter category");

    if (categories.includes(value))
      return toast.error("Already exists");

    setCategories([...categories, value]);
    setForm({ ...form, category: value });

    toast.success("Category added ✨");
    setNewCategory("");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <Toaster />

      {/* HEADER */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

  {/* TITLE */}
  <h2 className="text-xl font-semibold whitespace-nowrap">
    Add-ons
  </h2>

  {/* RIGHT SIDE */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">

    {/* SEARCH */}
    <input
      placeholder="Search..."
      className="glass-input w-full sm:w-64"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    {/* ACTION BUTTONS */}
    <div className="flex items-center gap-2 justify-end">

      <button
        onClick={() => setView("grid")}
        className={`icon-btn ${view === "grid" && "bg-indigo-100"}`}
      >
        <Grid size={16} />
      </button>

      <button
        onClick={() => setView("list")}
        className={`icon-btn ${view === "list" && "bg-indigo-100"}`}
      >
        <List size={16} />
      </button>

      <button
        onClick={() => setOpen(true)}
        className="primary-btn"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Add</span>
      </button>

    </div>
  </div>
</div>

      {/* GRID */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-3 ">
          {paginated.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6, scale: 1.025 }}
              className="glass-card border border-gray-200 p-2 rounded-lg bg-white/20 cursor-pointer"
            >
              {item.preview && (
                <img
                  src={item.preview}
                  className="h-32 w-full object-cover rounded-lg mb-3"
                />
              )}

              <div className="flex justify-between">
                <h3 className="font-semibold">{item.name}</h3>
                <Package size={18} />
              </div>

              <p className="text-sm text-gray-500">
                {item.category}
              </p>

              <p className="font-bold text-indigo-600 mt-1">
                ₹ {item.price}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setEditItem(item);
                    setForm(item);
                    setOpen(true);
                  }}
                  className="action-btn"
                >
                  <Edit size={14} /> Edit
                </button>

                <button
                  onClick={() => setDeleteItem(item)}
                  className="action-btn text-red-500"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* LIST */}
      {view === "list" && (
        <div className="space-y-4">
          {paginated.map((item) => (
            <div key={item.id} className="glass-row border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.category}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <p className="font-semibold">₹ {item.price}</p>
                <Edit size={16} />
                <Trash2
                  size={16}
                  className="text-red-500"
                  onClick={() => setDeleteItem(item)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`page-btn ${
              page === i + 1 && "active"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      <GlobalModal open={open} onClose={() => setOpen(false)}>
        <h3 className="modal-title">
          {editItem ? "Edit Add-on" : "Add Add-on"}
        </h3>

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="glass-input"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="glass-input flex-1"
          />
          <button onClick={handleAddCategory} className="primary-btn">
            Add
          </button>
        </div>

        <input
          placeholder="Addon Name"
          className="glass-input mt-2"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Price"
          className="glass-input mt-2"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        <input
          type="file"
          className="mt-3"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setForm({
                ...form,
                preview: URL.createObjectURL(file),
              });
            }
          }}
        />

        {form.preview && (
          <img src={form.preview} className="h-24 mt-2 rounded-lg" />
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={handleSave} className="primary-btn">
            Save
          </button>
        </div>
      </GlobalModal>

      {/* DELETE MODAL */}
      <GlobalModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
      >
        <h3 className="modal-title text-center">
          Delete Add-on?
        </h3>
        <p className="text-center text-gray-500 mt-2">
          {deleteItem?.name}
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setDeleteItem(null)}>
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Delete
          </button>
        </div>
      </GlobalModal>

      {/* STYLES */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(18px);
          border-radius: 18px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .glass-row {
          background: rgba(255, 255, 255, 0.4);
          padding: 14px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
        }

        .glass-input {
          padding: 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.5);
          border: 1px solid #e5e7eb;
          width: 100%;
        }

        .primary-btn {
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: white;
          padding: 8px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .icon-btn {
          padding: 8px;
          border-radius: 10px;
          background: white;
        }

        .page-btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: white;
        }

        .page-btn.active {
          background: #6366f1;
          color: white;
        }

        .modal-title {
          font-weight: 600;
          margin-bottom: 10px;
        }

        .action-btn {
          font-size: 12px;
          display: flex;
          gap: 4px;
          align-items: center;
        }
      `}</style>
    </div>
  );
}