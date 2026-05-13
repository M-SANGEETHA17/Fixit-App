import { useNavigate } from "react-router-dom";

export default function Service() {
const navigate = useNavigate();
 const services = [
  {
    name: "Home Cleaning",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    desc: "Deep cleaning for homes & apartments",
        route: "/homecleaning"

  },
  {
  name: "Electrical Repair",
  img: "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?auto=format&fit=crop&w=800&q=80",
  desc: "Wiring, switch & power solutions",
  route:"/electricalrepair"
},
{
  name: "Plumbing Service",
  img: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80",
  desc: "Leak fixing & pipe installation",
  route:"/plumbing"
},
{
  name: "AC Service",
  img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
  desc: "Cooling repair & maintenance",
  route:"/ACservice"
},
{
  name: "Pest Control",
  img: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=800&q=80",
  desc: "Safe eco-friendly pest removal & protection",
  route:"/Pestcontrol"
},
{
  name: "Carpentry Work",
  img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  desc: "Furniture making & wood repair",
  route:"/carpentry"
}
];

  return (
    <div className="py-16 px-6 bg-gradient-to-b from-green-50 to-white">

      <h2 className="text-4xl font-bold text-center text-green-700 mb-12">
        Our Services
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {services.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition duration-300"
          >

            <div className="h-44 overflow-hidden">
              <img
                src={s.img}
                alt={s.name}
                className="w-full h-full object-cover hover:scale-110 transition duration-500"
              />
            </div>

            <div className="p-5">

              <h3 className="text-xl font-bold text-green-700">
                {s.name}
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                {s.desc}
              </p>

              <button
                onClick={() => navigate(s.route)} 
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
                Book Service
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}