import PhotoStep from "../[id]/steps/PhotoStep";
import BasicStep from "../[id]/steps/BasicStep";
import CapacityStep from "../[id]/steps/CapacityStep";

export default function StepRenderer({ step, form, setForm }) {
  switch (step) {
    case "photo":
      return <PhotoStep form={form} setForm={setForm} />;
    case "basic":
      return <BasicStep form={form} setForm={setForm} />;
    case "capacity":
      return <CapacityStep form={form} setForm={setForm} />;
    default:
      return <div>Coming soon</div>;
  }
}
