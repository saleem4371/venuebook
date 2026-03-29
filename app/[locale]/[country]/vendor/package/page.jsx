"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

/* ---------------- GLOBAL MODAL ---------------- */
function GlobalModal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="
              fixed z-50 
              bottom-0 left-0 right-0
              md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px]
              bg-white/90 backdrop-blur-2xl
              rounded-t-3xl md:rounded-2xl
              p-5 shadow-2xl
            "
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function MenuManager() {
  const [tab, setTab] = useState("category");

  const [categories, setCategories] = useState([
    { id: 1, name: "Starters", published: true },
    { id: 2, name: "Main Course", published: true },
  ]);

  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);

  /* ---------------- CATEGORY ---------------- */
  const [openCategory, setOpenCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const handleCategory = (val) => {
    setCategoryName(val);

    if (!val) setCategoryError("Required");
    else if (categories.some(c => c.name === val))
      setCategoryError("Already exists");
    else setCategoryError("");
  };

  const addCategory = () => {
    if (categoryError || !categoryName) return;

    setCategories([
      ...categories,
      { id: Date.now(), name: categoryName, published: true }
    ]);

    toast.success("Category added");
    setOpenCategory(false);
    setCategoryName("");
  };

  const togglePublish = (id) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, published: !c.published } : c
    ));
  };

  /* ---------------- ITEM ---------------- */
  const [openItem, setOpenItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    type: "veg"
  });
  const [itemError, setItemError] = useState({});

  const validateItem = (data) => {
    let err = {};
    if (!data.name) err.name = "Required";
    if (!data.price) err.price = "Required";
    if (!data.categoryId) err.categoryId = "Required";
    setItemError(err);
    return Object.keys(err).length === 0;
  };

  const addItem = () => {
    if (!validateItem(itemForm)) return;

    setItems([...items, { id: Date.now(), ...itemForm }]);
    toast.success("Item added");
    setOpenItem(false);
    setItemForm({ name: "", price: "", categoryId: "", type: "veg" });
  };

  /* ---------------- PACKAGE ---------------- */
  const [openPackage, setOpenPackage] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: "",
    price: "",
    type: "veg",
    categoryLimits: {}
  });

  const addPackage = () => {
    if (!packageForm.name || !packageForm.price)
      return toast.error("Fill all");

    setPackages([...packages, { id: Date.now(), ...packageForm }]);
    toast.success("Package created");
    setOpenPackage(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ---------------- TABS ---------------- */}
      <div className="flex gap-2 overflow-x-auto">
        {["category", "items", "packages"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-white/40 backdrop-blur-xl"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---------------- CATEGORY ---------------- */}
      {tab === "category" && (
        <>
          <button onClick={() => setOpenCategory(true)} className="primary-btn">
            <Plus size={16}/> Add Category
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(c => (
              <motion.div key={c.id} whileHover={{ scale: 1.03 }} className="glass-card">
                <div className="flex justify-between">
                  <h3 className="text-sm md:text-base">{c.name}</h3>

                  <button onClick={() => togglePublish(c.id)}>
                    {c.published
                      ? <CheckCircle className="text-green-500"/>
                      : <XCircle className="text-gray-400"/>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ---------------- ITEMS ---------------- */}
      {tab === "items" && (
        <>
          <button onClick={() => setOpenItem(true)} className="primary-btn">
            <Plus size={16}/> Add Item
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(i => (
              <div key={i.id} className="glass-card">
                <h4>{i.name}</h4>
                <p className="text-sm text-gray-500">₹ {i.price}</p>
                <p className="text-xs">{i.type}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------------- PACKAGES ---------------- */}
      {tab === "packages" && (
        <>
          <button onClick={() => setOpenPackage(true)} className="primary-btn">
            <Plus size={16}/> Add Package
          </button>

          <div className="grid md:grid-cols-3 gap-4">
            {packages.map(p => (
              <div key={p.id} className="glass-card">
                <h4>{p.name}</h4>
                <p>₹ {p.price}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------------- CATEGORY MODAL ---------------- */}
      <GlobalModal open={openCategory} onClose={() => setOpenCategory(false)}>
        <h3 className="mb-3 font-semibold">Add Category</h3>

        <input
          value={categoryName}
          onChange={(e) => handleCategory(e.target.value)}
          className="input"
          placeholder="Category"
        />

        {categoryError && <p className="error">{categoryError}</p>}

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => setOpenCategory(false)}>Cancel</button>
          <button onClick={addCategory} className="primary-btn">Save</button>
        </div>
      </GlobalModal>

      {/* ---------------- ITEM MODAL ---------------- */}
      <GlobalModal open={openItem} onClose={() => setOpenItem(false)}>
        <h3 className="mb-3 font-semibold">Add Item</h3>

        <input
          placeholder="Name"
          className="input"
          onChange={(e)=>setItemForm({...itemForm,name:e.target.value})}
        />
        {itemError.name && <p className="error">{itemError.name}</p>}

        <input
          placeholder="Price"
          type="number"
          className="input mt-2"
          onChange={(e)=>setItemForm({...itemForm,price:e.target.value})}
        />
        {itemError.price && <p className="error">{itemError.price}</p>}

        <select
          className="input mt-2"
          onChange={(e)=>setItemForm({...itemForm,categoryId:e.target.value})}
        >
          <option value="">Category</option>
          {categories.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-3">
          {["veg","nonveg","other"].map(t=>(
            <button
              key={t}
              onClick={()=>setItemForm({...itemForm,type:t})}
              className={`chip ${itemForm.type===t && "active"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <button onClick={addItem} className="primary-btn w-full mt-4">
          Save
        </button>
      </GlobalModal>

      {/* ---------------- PACKAGE MODAL ---------------- */}
      <GlobalModal open={openPackage} onClose={() => setOpenPackage(false)}>
        <h3 className="mb-3 font-semibold">Create Package</h3>

        <input
          placeholder="Name"
          className="input"
          onChange={(e)=>setPackageForm({...packageForm,name:e.target.value})}
        />

        <input
          placeholder="Price"
          type="number"
          className="input mt-2"
          onChange={(e)=>setPackageForm({...packageForm,price:e.target.value})}
        />

        <div className="grid grid-cols-2 gap-2 mt-3">
          {categories.map(c=>(
            <input
              key={c.id}
              placeholder={`${c.name} qty`}
              type="number"
              className="input"
              onChange={(e)=>setPackageForm({
                ...packageForm,
                categoryLimits:{
                  ...packageForm.categoryLimits,
                  [c.id]:e.target.value
                }
              })}
            />
          ))}
        </div>

        <button onClick={addPackage} className="primary-btn w-full mt-4">
          Create
        </button>
      </GlobalModal>

      {/* ---------------- STYLES ---------------- */}
      <style jsx>{`
        .glass-card {
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(14px);
          border-radius: 14px;
          padding: 14px;
        }
        .input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        .primary-btn {
          background: #6366f1;
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
        .chip {
          padding: 6px 10px;
          border-radius: 999px;
          background: #eee;
        }
        .active {
          background: #6366f1;
          color: white;
        }
        .error {
          color: red;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}