import UnifiedService from "./UnifiedService";

export default function CarpentryService() {
  return (
    <UnifiedService
      serviceName="Carpentry"
      title="Carpentry Work"
      subtitle="Professional Carpentry & Wood Services"
      welcomeMessage="carpenters available!"
      serviceOptions={[
        "Furniture Repair",
        "General Woodwork",
        "Door/Window Repair",
        "Modular Kitchen"
      ]}
    />
  );
}