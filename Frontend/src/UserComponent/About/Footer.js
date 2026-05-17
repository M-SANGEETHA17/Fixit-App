import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
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
  const [footerData, setFooterData] = useState({
    companyName: "Life Changers Ind",
    mainBranch: "5/106A, JJ Nagar, Reddiarpatti, Tirunelveli, Tamil Nadu 627007",
    subBranch: "Makkah Mukarramah Street, Safath, Jubail - 35514",
    phones: [
      "+91 94860 42369",
      "+91 99430 42369",
      "+91 81480 42369"
    ],
    email: "lifechangersind@gmail.com"
  });

  useEffect(() => {
    const apiUrl = `${API_BASE_URL}/api/settings`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Response is not JSON");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.companyName) {
          setFooterData(data);
        }
      })
      .catch((err) => {
        console.log("Footer using local default fallback data:", err.message || err);
      });
  }, []);

  const nameParts = footerData.companyName.split(" ");
  const firstWord = nameParts[0] || "Life";
  const secondWord = nameParts[1] || "Changers";
  const thirdWord = nameParts.slice(2).join(" ") || "Ind";

  return (
    <footer className="bg-green-100 text-green-900 pt-16 pb-8 px-6 border-t border-green-200">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-green-600">{firstWord} </span>
            <span className="text-gray-800">{secondWord}</span>
            <span className="text-green-600"> {thirdWord}</span>
          </h1>

          <div className="space-y-4 text-sm text-green-800/90">
            <div className="flex gap-3 items-start">
              <FaMapMarkerAlt className="text-green-600 text-lg mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-green-900">Main-Branch :</span>{" "}
                {footerData.mainBranch}
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <FaMapMarkerAlt className="text-green-600 text-lg mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-green-900">Sub-Branch :</span>{" "}
                {footerData.subBranch}
              </div>
            </div>
          </div>

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

        {/* QUICK LINKS COLUMN */}
        <div>
          <h2 className="font-bold text-lg text-green-800 mb-4 border-b border-green-200 pb-2">
            Quick Links
          </h2>
          <ul className="space-y-3 text-sm text-green-800/85">
            <li className="hover:text-green-600 hover:translate-x-1 cursor-pointer transition-all duration-200">About Us</li>
            <li className="hover:text-green-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Pricing</li>
            <li className="hover:text-green-600 hover:translate-x-1 cursor-pointer transition-all duration-200">FAQ</li>
            <li className="hover:text-green-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Terms & Conditions</li>
            <li className="hover:text-green-600 hover:translate-x-1 cursor-pointer transition-all duration-200">Careers</li>
          </ul>
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
              {footerData.phones.map((phone, idx) => (
                <p key={idx} className="flex items-center gap-3 hover:text-green-600 transition-colors">
                  <FaPhoneAlt className="text-green-600" /> {phone}
                </p>
              ))}
            </div>

            <p className="flex items-center gap-3 border-t border-green-200/50 pt-3 hover:text-green-600 transition-colors">
              <FaEnvelope className="text-green-600" /> {footerData.email}
            </p>
          </div>
        </div>

      </div>

      {/* COPYRIGHT SECTION */}
      <div className="border-t border-green-200 mt-12 pt-6 text-center text-sm text-green-700 font-medium">
        © 2026 <span className="text-green-600 font-bold">{footerData.companyName}</span>. All Rights Reserved.
      </div>
    </footer>
  );
}