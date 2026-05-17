import UnifiedService from "./UnifiedService";
import Footer from "../Footer";

export default function PestControlService() {
  return (
    <div>
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
    /><Footer/>
    </div>
  );
}