import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRef, useState } from "react";
import axios from "axios";
import Service from "./Service";
import StatsSection from "./StatsSection";
import Footer from "./Footer";

export default function Home() {
  const sliderRef = useRef(null);

  const [selectedWorker, setSelectedWorker] = useState(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
  };

  const slides = [
    {
      img: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
      title: "Home Cleaning",
      desc: "Professional cleaning services",
    },
    {
      img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4",
      title: "Electrical Repair",
      desc: "Safe electrical solutions",
    },
    {
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      title: "Plumbing",
      desc: "Quick plumbing fixes",
    },
    {
      img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
      title: "AC Repair",
      desc: "Cool service experts",
    },
  ];

  const handleBook = async (service) => {
  if (!selectedWorker) {
    alert("Please select a worker first");
    return;
  }

  try {
    await axios.post("https://fixit-app-w0dp.onrender.com/api/bookings/create", {
      name: "Guest User", 
      phone: "0000000000",
      serviceType: service,
      location: "Not Provided",
      workerId: selectedWorker._id
    });

    alert("Booking added successfully");
  } catch (err) {
    console.log(err);
    alert("Booking failed");
  }
};
  return (
    <div className="w-full min-h-screen overflow-x-hidden relative">
      <div className="relative w-full h-screen">

        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full"
        >
          <FaChevronLeft />
        </button>

        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full"
        >
          <FaChevronRight />
        </button>

        <Slider ref={sliderRef} {...settings}>
          {slides.map((s, i) => (
            <div key={i} className="h-screen relative">

              <img
                src={s.img}
                className="w-full h-full object-cover"
                alt={s.title}
              />

              <div className="absolute inset-0 bg-black/40"></div>

              <div className="absolute top-1/2 left-10 -translate-y-1/2 text-white">

                <h1 className="text-5xl font-bold">{s.title}</h1>
                <p className="mt-2">{s.desc}</p>

                <button
                  onClick={() => handleBook(s.title)}
                  className="mt-5 bg-green-500 px-6 py-3 rounded-lg"
                >
                  Book Service
                </button>

              </div>

            </div>
          ))}
        </Slider>
      </div>

      <Service />
      <StatsSection />
      <Footer />

    </div>
  );
}