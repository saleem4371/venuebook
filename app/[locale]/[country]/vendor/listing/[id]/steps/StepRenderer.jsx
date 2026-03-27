import PhotoStep from "./PhotoStep";
import BasicStep from "./BasicStep";
import CapacityStep from "./CapacityStep";
import LocationStep from "./LocationStep";
import PricingStep from "./PricingStep";

export default function StepRenderer({ step, form, setForm }) {
  switch (step) {
    case "photo":
      return <PhotoStep form={form} setForm={setForm} />;

    case "basic":
       return <BasicStep form={form} setForm={setForm} />;

    case "capacity":
        return <CapacityStep form={form} setForm={setForm} />;
     

    case "location":
       return <LocationStep form={form} setForm={setForm} />;
       

    case "pricing":
      return <PricingStep form={form} setForm={setForm} />;

    case "terms":
      return (
        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(e) =>
              setForm({
                ...form,
                termsAccepted: e.target.checked,
              })
            }
          />
          Accept Terms
        </label>
      );

    default:
      return <div>Optional step</div>;
  }
}
