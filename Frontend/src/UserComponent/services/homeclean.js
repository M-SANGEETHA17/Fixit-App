import UnifiedService from "./UnifiedService";

export default function HomeCleaning() {
  return (
    <UnifiedService
      serviceName="Home Cleaning"
      title="Home Cleaning"
      subtitle="Professional Home Cleaning Services"
      welcomeMessage="cleaning experts available!"
      serviceOptions={[
        "Full Home Deep Cleaning",
        "Kitchen Deep Cleaning",
        "Bathroom Deep Cleaning",
        "Sofa/Carpet Cleaning"
      ]}
    />
  );
}