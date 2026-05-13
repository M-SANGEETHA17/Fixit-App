import React, { useEffect, useState } from "react";

const statsData = [
  {
    id: 1,
    img: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
    number: 5000,
    label: "Services Completed",
    suffix: "+",
  },
  {
    id: 2,
    img: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
    number: 1000,
    label: "Happy Customers",
    suffix: "+",
  },
  {
    id: 3,
    img: "https://cdn-icons-png.flaticon.com/512/2972/2972531.png",
    number: "24/7",
    label: "Customer Support",
    suffix: "",
    isText: true,
  },
  {
    id: 4,
    img: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
    number: "100",
    label: "Verified Technicians",
    suffix: "%",
    isText: true,
  },
];

const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof target !== "number") return;

    let start = 0;
    const increment = target / 80;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setCount(target);
      } else {
        setCount(Math.ceil(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="bg-gradient-to-b from-green-50 to-white py-16 px-4">
      
     
      <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-12 animate-fade-in">
        Why Our Service?
      </h2>

      
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        {statsData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border border-green-100"
          >
   
            <img
              src={item.img}
              alt={item.label}
              className="w-16 h-16 mx-auto mb-4 animate-bounce-slow"
            />

           
            <h3 className="text-2xl font-bold text-green-700">
              {item.isText ? item.number + item.suffix : (
                <Counter target={item.number} suffix={item.suffix} />
              )}
            </h3>

           
            <p className="text-gray-600 mt-2">{item.label}</p>
          </div>
        ))}

      </div>
    </section>
  );
};

export default StatsSection;