import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaBars, FaTimes } from "react-icons/fa";
import AdminLogin from "../AdminComponent/AdminLogin";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <nav className="bg-green-100 text-green-900 px-4 md:px-10 py-4 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center">

        <div>
          <Link to="/adminlogin">
  <h1 className="text-2xl md:text-3xl font-extrabold tracking-widest cursor-pointer">
    <span className="text-green-600">FIX</span>
    <span className="text-gray-800">IT</span>
  </h1>
</Link>
          <p className="text-[10px] text-green-500 -mt-1 tracking-widest hidden md:block">
            Real-time on demand services
          </p>
        </div>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <Link to="/cmpy" className="hover:text-green-600">About</Link>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 hover:text-green-600"
            >
              Our Services <RiArrowDropDownLine size={22} />
            </button>

            {open && (
              <div className="absolute top-10 left-0 bg-white border w-64 rounded-lg shadow-lg z-50">
                <Link to="/homecleaning" className="block px-4 py-3 hover:bg-green-100">Home Cleaning</Link>
                <Link to="/plumbing" className="block px-4 py-3 hover:bg-green-100">Plumbing</Link>
                <Link to="/electricalrepair" className="block px-4 py-3 hover:bg-green-100">Electrical</Link>
                <Link to="/ACservice" className="block px-4 py-3 hover:bg-green-100">AC Service</Link>
                <Link to="/carpentry" className="block px-4 py-3 hover:bg-green-100">Carpentry</Link>
                <Link to="/Pestcontrol" className="block px-4 py-3 hover:bg-green-100">Pest Control</Link>
              </div>
            )}
          </div>

          <Link to="/contact" className="hover:text-green-600">Feedback</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
  {user ? (
    <>
      <span className="font-semibold text-green-700">
        {user.name}
      </span>

      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        className="px-5 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 text-sm"
      >
        Login
      </Link>

      <Link
        to="/register"
        className="px-5 py-2 rounded-full border border-green-500 text-green-600 bg-white hover:bg-green-100 text-sm"
      >
        Sign Up
      </Link>
    </>
  )}

  <Link
    to="/workerlogin"
        className="px-5 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 text-sm"
  >
    Worker Login
  </Link>
</div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm font-medium">
          <Link to="/">Home</Link>
          <Link to="/cmpy">About</Link>
          <Link to="/adminuser">Users</Link>
          <div>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1"
            >
              Our Services <RiArrowDropDownLine size={22} />
            </button>

            {open && (
              <div className="ml-4 mt-2 flex flex-col gap-2">
                <Link to="/homecleaning">Home Cleaning</Link>
                <Link to="/plumbing">Plumbing</Link>
                <Link to="/electricalrepair">Electrical</Link>
                <Link to="/ACservice">AC Service</Link>
                <Link to="/carpentry">Carpentry</Link>
                <Link to="/Pestcontrol">Pest Control</Link>
              </div>
            )}
          </div>

          <Link to="/contact">Contact</Link>
          <Link
          to="/workerlogin"
          className="flex-1 text-center py-2 bg-green-500 text-white rounded">
          Worker Login
          </Link>

          {user ? (
            <>
              <span className="font-semibold">{user.name}</span>

              <button
                onClick={handleLogout}
                className="py-2 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 mt-3">
              <Link
                to="/login"
                className="flex-1 text-center py-2 bg-green-500 text-white rounded"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="flex-1 text-center py-2 border border-green-500 text-green-600 rounded"
              >
                Sign Up
              </Link>


            </div>
          )}
        </div>
      )}
    </nav>
  );
}