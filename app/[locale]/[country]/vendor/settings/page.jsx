"use client";

import { useState , useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Calendar,
  CreditCard,
  FileText,
  Gift,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";


import { useVendorCategory } from "@/context/VendorCategoryContext";

import { settingsAPI , saveSettingsAPI , loadSettingsAPI} from "@/services/settings.service";

const BRAND = "linear-gradient(242deg,#a44bf3,#499ce8)";



export default function SettingsPage() {
  const { activeCategory } = useVendorCategory();

 const [loadData, setLoadData] = useState([]);
const [settings, setSettings] = useState({});
const [loadSetting, setLoadSetting] = useState({});

const load = async () => {
  try {
    if (!activeCategory) return;

    // Form schema
    const res = await settingsAPI(activeCategory);
    const groups = res?.data ?? [];
    setLoadData(groups);

    // Saved settings
    const resp = await loadSettingsAPI(activeCategory);

    const data = resp?.data ?? {};
    const savedSettings = data.settings ?? [];

    // Array -> Object
    const dbMap = savedSettings.reduce((acc, item) => {
      let value = item.value;

      if (value === "1") value = true;
      else if (value === "0") value = false;

      acc[item.key] = value;

      return acc;
    }, {});

    const values = {};

    groups.forEach((group) => {
      group.settings.forEach((field) => {
        if (dbMap.hasOwnProperty(field.key)) {
          values[field.key] = dbMap[field.key];
        } else {
          values[field.key] =
            field.type === "toggle"
              ? Boolean(field.value)
              : field.value ?? field.default_value ?? "";
        }
      });
    });

    setSettings(values);

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {

load();


}, [activeCategory]);

  const initialSettings = loadData.reduce((acc, section) => {
  section.settings.forEach((field) => {
    if (field.type === "toggle") {
      acc[field.key] = false;
    } else {
      acc[field.key] = "";
    }
  });

  return acc;
}, {});


  const toggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

const [saving, setSaving] = useState(false);

const handleSubmit = async () => {
  try {
    setSaving(true);

    const payload = {
      category_id: activeCategory,
      settings: Object.keys(settings).map((key) => ({
        key,
        value: settings[key],
      })),
    };

    console.log(payload);

     await saveSettingsAPI(payload);

     toast.success("Settings saved successfully");
  } catch (error) {
    console.error(error);
    // toast.error("Failed to save settings");
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="min-h-screen">
      <div className="p-2 space-y-6">
        {/* Header */}
     
        <div className="mb-8">
  <div className="inline-flex items-center gap-2 mb-3">
    <div
      className="h-2 w-2 rounded-full"
      style={{
        background:
          "linear-gradient(242deg,#a44bf3,#499ce8)",
      }}
    />

    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
      Workspace Settings
    </span>
  </div>

  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    General Settings
  </h1>

  <p className="mt-2 text-gray-500 dark:text-gray-400">
    Configure pricing, bookings, loyalty programs and business rules.
  </p>

</div>


        {/* Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-2">
  {loadData.map((section) => {
    const Icon = section.icon;

    return (
      <SettingsCard
        key={section.id}
        title={section.name}
        description={section.description}
        // icon={<Icon size={18} />}
      >
        {section.settings.map((field) => {
          if (field.type === "toggle") {
            return (
              <ToggleRow
                key={field.key}
                label={field.label}
                value={settings[field.key]}
                onChange={() => toggle(field.key)}
              />
            );
          }
          return (
            <InputRow
              key={field.key}
              label={field.label}
              value={settings[field.key] ?? ""}
              placeholder={field.placeholder}
            
                
  onChange={(value) =>
    setSettings((prev) => ({
      ...prev,
      [field.key]: value,
    }))
  }
            />
          );
        })}
      </SettingsCard>
    );
  })}
</div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-5 z-20 ">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 rounded-2xl shadow-lg p-2 flex justify-end">
            <button
  onClick={handleSubmit}
  style={{ background: BRAND }}
  className="px-6 py-3 rounded-xl text-white font-medium shadow-lg disabled:opacity-50"
>
  {saving ? "Saving..." : "Save Settings"}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  icon,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div
  className="
    h-11
    w-11
    rounded-2xl
    flex
    items-center
    justify-center
    text-white
    shadow-lg
  "
  style={{
    background:
      "linear-gradient(242deg,#a44bf3,#499ce8)",
  }}
>
  {icon}
</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>

            <p className="text-xs text-gray-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/10">
        {children}
      </div>
    </motion.div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}) {
  return (
    <div className="p-4 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>

      <button
        onClick={onChange}
        style={{ background: value ? BRAND : undefined }}
        className={`relative w-11 h-6 rounded-full transition-all ${
          value
            ? ""
            : "bg-gray-200 dark:bg-white/10"
        }`}
      >
        <motion.span
          layout
          className="absolute top-1 w-4 h-4 rounded-full bg-white"
          style={{
            left: value ? "22px" : "4px",
          }}
        />
      </button>
    </div>
  );
}

function InputRow({
  label,
  value,
  placeholder,
  onChange,
}) {
  return (
    <div className="p-4">
      <label className="block text-xs font-medium text-gray-500 mb-2">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-gray-200
          px-3
          py-2
          text-sm
          outline-none
          focus:ring-2
          focus:ring-violet-500
        "
      />
    </div>
  );
}