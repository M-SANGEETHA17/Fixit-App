import UnifiedService from "./UnifiedService";

export default function ACService() {
  return (
    <UnifiedService
      serviceName="AC Service"
      title="AC Service"
      subtitle="Instant AC Repair & Service"
      welcomeMessage="AC experts available!"
      serviceOptions={[
        "AC Installation",
        "Cooling Issue Repair",
        "Gas Refill",
        "AC Uninstallation"
      ]}
    />
  );
}