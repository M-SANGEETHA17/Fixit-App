import UnifiedService from "./UnifiedService";
import Footer from "../Footer";

export default function PlumbingService() {
  return (
    <div>
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
    /><Footer/>
    </div>
  );
}