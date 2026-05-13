import { FaUsers, FaTools, FaStar } from "react-icons/fa";
import Footer from "../Footer";

export default function About() {
  return (
    <div className="bg-gradient-to-b from-green-100 to-white min-h-screen">

      <div
        className="h-[350px] flex items-center justify-center text-white text-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-600/60"></div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold tracking-wide">
            About <span className="text-green-300">FixIt</span>
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Making Home Services Simple & Reliable
          </p>
        </div>
      </div>

      {/* GLASS CARD INTRO */}
      <div className="max-w-5xl mx-auto -mt-16 px-6">
        <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-center">
          <p className="text-gray-700 leading-7">
            FixIt is your all-in-one platform to book trusted professionals for
            plumbing, electrical work, cleaning and more. We connect skilled
            workers with customers in a fast, safe, and seamless way.
          </p>
        </div>
      </div>

      {/* SECTION WITH IMAGE */}
      <div className="grid md:grid-cols-2 gap-10 items-center px-6 max-w-6xl mx-auto mt-16">

        <img
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
          className="rounded-2xl shadow-xl hover:scale-105 transition duration-300"
          alt="workers"
        />

        <div>
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Our Mission
          </h2>

          <p className="text-gray-700 leading-7">
            Our mission is to provide quick, affordable and trusted services
            for every household. We focus on quality, transparency and customer
            satisfaction above everything.
          </p>
        </div>

      </div>

      {/* STATS SECTION */}
      <div className="bg-green-600 text-white py-14 mt-16">

        <div className="grid md:grid-cols-3 text-center gap-8 max-w-6xl mx-auto">

          <div>
            <FaUsers className="text-4xl mx-auto mb-3" />
            <h2 className="text-3xl font-bold">1000+</h2>
            <p>Happy Customers</p>
          </div>

          <div>
            <FaTools className="text-4xl mx-auto mb-3" />
            <h2 className="text-3xl font-bold">250+</h2>
            <p>Verified Workers</p>
          </div>

          <div>
            <FaStar className="text-4xl mx-auto mb-3" />
            <h2 className="text-3xl font-bold">4.8★</h2>
            <p>Average Rating</p>
          </div>

        </div>

      </div>

      {/* WHY CHOOSE US */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-green-700 text-center mb-10">
          Why Choose FixIt?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Trusted Experts
            </h3>
            <p>All workers are verified and skilled professionals.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Quick Booking
            </h3>
            <p>Book services instantly with just a few clicks.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Affordable Price
            </h3>
            <p>No hidden charges. Transparent pricing always.</p>
          </div>

        </div>

      </div>
<Footer/>
    </div>
  );
}