import UnifiedService from "./UnifiedService";

export default function PlumbingService() {
  return (
    <UnifiedService
      serviceName="Plumbing"
      title="Plumbing Service"
      subtitle="Reliable Plumbing & Pipe Repair"
      welcomeMessage="plumbers available!"
      serviceOptions={[
        "Leak Repair",
        "Pipe Replacement",
        "Bathroom Fitting",
        "Water Tank Cleaning"
      ]}
    />
  );
}