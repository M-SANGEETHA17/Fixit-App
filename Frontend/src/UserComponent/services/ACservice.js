import UnifiedService from "./UnifiedService";
import Footer from "../Footer";

export default function ACService() {
  return (
    <div>
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
<Footer/>
    </div>
    
  );
}