import UnifiedService from "./UnifiedService";

export default function PestControlService() {
  return (
    <UnifiedService
      serviceName="Pest Control"
      title="Pest Control"
      subtitle="Professional Pest Control Services"
      welcomeMessage="pest control experts available!"
      serviceOptions={[
        "Termite Control",
        "Mosquito Control",
        "Cockroach Control",
        "Rodent Control"
      ]}
    />
  );
}