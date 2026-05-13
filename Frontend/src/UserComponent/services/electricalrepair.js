import UnifiedService from "./UnifiedService";

export default function ElectricalRepair() {
  return (
    <UnifiedService
      serviceName="Electrical Repair"
      title="Electrical Repair"
      subtitle="Professional Electrical Repair & Wiring"
      welcomeMessage="electricians available!"
      serviceOptions={[
        "Fan Installation & Repair",
        "Light Fitting",
        "House Wiring",
        "Switchboard Repair"
      ]}
    />
  );
}