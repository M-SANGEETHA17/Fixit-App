import UnifiedService from "./UnifiedService";
import Footer from "../Footer";

export default function ElectricalRepair() {
  return (
    <div>

   
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
    /><Footer/>
    </div>
  );
}