"use client";

import { useMemo } from "react";

import PhotoStep     from "./PhotoStep";
import BasicStep     from "./BasicStep";
import CapacityStep  from "./CapacityStep";
import LocationStep  from "./LocationStep";
import PricingStep   from "./PricingStep";
import AmenitiesStep from "./AmenitiesStep";
import TagsStep      from "./TagsStep";
import AddonsStep    from "./AddonsStep";
import TermsStep     from "./TermsStep";

export default function StepRenderer({ step, form, setForm, category , amenities , property ,
   event,categorys,  onDeleteImgeFile} ) {
 // const props = { form, setForm, category, amenities };



  const props = useMemo(() => ({
  form,
  setForm,
  category,
  amenities,
  property,
  event,
  categorys
}), [form, setForm, category, amenities , property, event,categorys]);


  switch (step) {
    case "photo":     return <PhotoStep     {...props} onDeleteImgeFile={onDeleteImgeFile}/>;
    case "basic":     return <BasicStep     {...props} />;
    case "tags":      return <TagsStep      {...props} />;
    case "addons":    return <AddonsStep    {...props} />;
    case "capacity":  return <CapacityStep  {...props} />;
    case "amenities": return <AmenitiesStep {...props} />;
    case "location":  return <LocationStep  {...props} />;
    case "pricing":   return <PricingStep   {...props} />;
    case "terms":     return <TermsStep     {...props} />;
    default:
      return <div className="p-8 text-center text-gray-400">Optional step — no configuration needed.</div>;
  }
}
