import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedinIn, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope 
} from "react-icons/fa";

export default function Footer() {
  const companyName = "FIXIT";
  const mainBranch = [
    "No. 45/9, 2nd Floor,",
    "Emerald Heights Commercial Complex,",
    "Kavuri Hills, Phase-2,",
    "Near Jubilee Hills Metro Station,",
    "Hyderabad, Telangana - 500033"
  ];
  const phones = [
    "+91 98765 43210",
    "+91 87654 32109"
  ];
  const email = "fixit@gmail.com";

  return (
    <footer className="bg-green-100 text-green-900 pt-16 pb-8 px-6 border-t border-green-200">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        
        {/* BRAND & BRANCHES COLUMN */}
        <div className="space-y-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-green-600">FIX</span>
              <span className="text-gray-800">IT</span>
            </h1>
            <p className="text-[11px] text-green-600/85 font-bold tracking-wide lowercase">on demand services</p>
          </div>

          <div className="space-y-4 text-sm text-green-800/90">
            <div className="flex gap-3 items-start">
              <FaMapMarkerAlt className="text-green-600 text-lg mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-green-900 block mb-1">Address :</span>
                {mainBranch.map((line, idx) => (
                  <p key={idx} className="text-xs text-green-800/80 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </div>

          {/* SOCIAL MEDIA ICONS */}
          <div className="flex gap-3 mt-6">
            <a href="#" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaTwitter className="text-sm" />
            </a>
            <a href="#" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaFacebookF className="text-sm" />
            </a>
            <a href="#" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaLinkedinIn className="text-sm" />
            </a>
            <a href="#" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaInstagram className="text-sm" />
            </a>
          </div>
        </div>

        {/* SERVICES COLUMN */}
        <div>
          <h2 className="font-bold text-lg text-green-800 mb-4 border-b border-green-200 pb-2">
            Services
          </h2>
          <ul className="space-y-3 text-sm text-green-800/85">
            <li className="hover:text-green-600 cursor-pointer transition-colors duration-200">Plumbing Service</li>
            <li className="hover:text-green-600 cursor-pointer transition-colors duration-200">Home Cleaning</li>
            <li className="hover:text-green-600 cursor-pointer transition-colors duration-200">Electrical Repair</li>
            <li className="hover:text-green-600 cursor-pointer transition-colors duration-200">AC Repair & Service</li>
            <li className="hover:text-green-600 cursor-pointer transition-colors duration-200">Pest Control & Painting</li>
          </ul>
        </div>

        {/* HELP & SUPPORT COLUMN */}
        <div>
          <h2 className="font-bold text-lg text-green-800 mb-4 border-b border-green-200 pb-2">
            Help & Support
          </h2>
          <div className="space-y-4 text-sm text-green-800/85">
            <p className="text-green-600 font-semibold italic">Mon - Sun : 9AM - 10PM</p>
            
            <div className="space-y-2">
              {phones.map((phone, idx) => (
                <p key={idx} className="flex items-center gap-3 hover:text-green-600 transition-colors">
                  <FaPhoneAlt className="text-green-600" /> {phone}
                </p>
              ))}
            </div>

            <p className="flex items-center gap-3 border-t border-green-200/50 pt-3 hover:text-green-600 transition-colors">
              <FaEnvelope className="text-green-600" /> {email}
            </p>
          </div>
        </div>

      </div>

      {/* COPYRIGHT SECTION */}
      <div className="border-t border-green-200 mt-12 pt-6 text-center text-sm text-green-700 font-medium">
        © 2026 <span className="text-green-600 font-bold">{companyName}</span>. All Rights Reserved.
      </div>
    </footer>
  );
}