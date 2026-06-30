"use client";

import { useState , useEffect } from "react";
import { SUBCATEGORIES } from "./config/subcategoryConfig";
import { BasicsSkeleton, useSkeletonDelay } from "./skeletons/index";

// ─── Shared input class helper ─────────────────────────────────────────────
const inputCls = (invalid) => [
  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
  "text-gray-900 dark:text-white text-sm outline-none transition",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  invalid
    ? "border-red-400 ring-1 ring-red-400"
    : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
].join(" ");

// ─────────────────────────────────────────────────────────────────────────────
//  BasicsStep — title, about, subcategory
// ─────────────────────────────────────────────────────────────────────────────

//API URL
import { getPropertyName } from "@/services/global.service";



export default function BasicsStep({ form, updateForm, attempted  }) {
  const [touched, setTouched] = useState({});

  const touch    = (f) => setTouched((p) => ({ ...p, [f]: true }));
  const showErr  = (f) => touched[f] || !!attempted?.basics;

  const isTitleValid  = form.title?.trim().length > 3;
  const isDescValid   = form.description?.trim().length >= 10;
  const isSubcatValid = !!form.subcategory;
  // const subcategories = SUBCATEGORIES[form.category] || [];

  // API — load subcategory / property-type options
  const [property,  setProperty]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useSkeletonDelay(isLoading);

  

  useEffect(() => {
    load();
  }, [form.category]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getPropertyName(form.category);
      setProperty(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

 const farmstayStyleGroups =
  form.category === "farmstay"
    ? Object.values(
        (property ?? []).reduce((acc, item) => {
          const groupName =
            item.style_property === 1
              ? "Farm Collection"
              : item.style_property === 2
              ? "Unique & Luxury Stay"
              : "Other";

          if (!acc[groupName]) {
            acc[groupName] = {
              group: groupName,
              options: [],
            };
          }

          acc[groupName].options.push({
            key: item.id,
            label: item.name,
          });

          return acc;
        }, {})
      )
    : [];

  if (showSkeleton) return <BasicsSkeleton />;

  return (
    <div className="space-y-8 sk-fade-in">

      {/* ── Property name ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Property name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title || ""}
          onChange={(e) => updateForm({ title: e.target.value })}
          onBlur={() => touch("title")}
          maxLength={60}
          placeholder="e.g. The Grand Oak Banquet Hall"
          className={inputCls(showErr("title") && !isTitleValid)}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-red-500">
            {showErr("title") && !isTitleValid ? "Minimum 4 characters required" : ""}
          </span>
          <span className="text-xs text-gray-400">{form.title?.length || 0}/60</span>
        </div>
      </div>

      {/* ── About / Description ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          About your property <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description || ""}
          onChange={(e) => updateForm({ description: e.target.value })}
          onBlur={() => touch("description")}
          maxLength={500}
          rows={5}
          placeholder="Describe what makes your space special — ambiance, location, unique features…"
          className={[
            "w-full px-4 py-3 rounded-xl border",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm",
            "outline-none transition resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500",
            showErr("description") && !isDescValid
              ? "border-red-400 ring-1 ring-red-400"
              : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
          ].join(" ")}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-red-500">
            {showErr("description") && !isDescValid
              ? "Please describe your property (min 10 characters)"
              : ""}
          </span>
          <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
        </div>
      </div>

      {/* ── Subcategory / Type ── */}
      {form.category !== "farmstay" && property.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Property type <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Select the type that best describes your property
          </p>

          <div className="flex flex-wrap gap-2">
            {property.map((sub) => {
              const active = form.subcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => { updateForm({ subcategory: sub.id }); touch("subcategory"); }}
                  className={[
                    "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    active
                      ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300",
                  ].join(" ")}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>

          {showErr("subcategory") && !isSubcatValid && (
            <p className="text-xs text-red-500 mt-2">Please select a property type</p>
          )}
        </div>
      )}

      {/* ── Farmstay Style (farmstay only) ── */}
      {form.category === "farmstay" && (
        // <FarmstayStyleSelector
        //   value={form.farmstayStyle || ""}
        //   onChange={(v) => { updateForm({ farmstayStyle: v }); touch("farmstayStyle"); }}
        //   showError={showErr("farmstayStyle") && !form.farmstayStyle}
        // />
        <FarmstayStyleSelector
  groups={farmstayStyleGroups}
  value={form.farmstayStyle || ""}
  onChange={(v) => {
    updateForm({ farmstayStyle: v });
    touch("farmstayStyle");
  }}
  showError={showErr("farmstayStyle") && !form.farmstayStyle}
/>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FarmstayStyleSelector — chip groups for farmstay-specific style
//  Rendered only when category === "farmstay"
// ─────────────────────────────────────────────────────────────────────────────



// function FarmstayStyleSelector({ value, onChange, showError }) {
//   return (
//     <div>
//       <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
//         Farmstay style <span className="text-red-500">*</span>
//       </label>
//       <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
//         Choose the style that best describes your farmstay
//       </p>

//       <div className="space-y-4">
//         {FARMSTAY_STYLE_GROUPS.map((grp) => (
//           <div key={grp.group}>
//             <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
//               {grp.group}
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {grp.options.map((opt) => {
//                 const active = value === opt.key;
//                 return (
//                   <button
//                     key={opt.key}
//                     type="button"
//                     onClick={() => onChange(opt.key)}
//                     className={[
//                       "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
//                       "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
//                       active
//                         ? "border-violet-600 bg-violet-600 text-white shadow-sm"
//                         : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300",
//                     ].join(" ")}
//                   >
//                     {opt.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showError && (
//         <p className="text-xs text-red-500 mt-2">Please select a farmstay style</p>
//       )}
//     </div>
//   );
// }
function FarmstayStyleSelector({
  groups,
  value,
  onChange,
  showError,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
        Farmstay style <span className="text-red-500">*</span>
      </label>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Choose the style that best describes your farmstays
      </p>

      <div className="space-y-4">
        {(groups || []).map((grp) => (
          <div key={grp.group}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              {grp.group}
            </p>

            <div className="flex flex-wrap gap-2">
              {grp.options.map((opt) => {
                const active = value === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onChange(opt.key)}
                    className={[
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                      active
                        ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showError && (
        <p className="text-xs text-red-500 mt-2">
          Please select a farmstay style
        </p>
      )}
    </div>
  );
}