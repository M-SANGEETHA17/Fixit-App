import UnifiedService from "./UnifiedService";
import Footer from "../Footer";

export default function CarpentryService() {
  return (
    <div>
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
<Footer/>
    </div>
    
  );
}