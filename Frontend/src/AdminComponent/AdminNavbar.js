import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function AdminNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) =>
    location.pathname.toLowerCase().includes(path);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
  };

  return (
    <nav className="bg-green-100 text-green-900 px-6 md:px-10 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">

      
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-widest">
          <span className="text-green-600">FIX</span>
          <span className="text-gray-800">IT</span>
        </h1>
        <p className="text-[10px] text-green-500 -mt-1 tracking-widest">
          Admin Panel
        </p>
      </div>

     
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link to="/admindashboard" className={`${isActive("admindashboard") && "text-green-700 font-bold"}`}>Dashboard</Link>
        <Link to="/adminworker" className={`${isActive("adminworker") && "text-green-700 font-bold"}`}>Workers</Link>
        <Link to="/adminuser" className={`${isActive("adminuser") && "text-green-700 font-bold"}`}>Users</Link>
        <Link to="/adminrequest" className={`${isActive("adminrequest") && "text-green-700 font-bold"}`}>Requests</Link>
        <Link to="/adminreport" className={`${isActive("adminreport") && "text-green-700 font-bold"}`}>Reports</Link>
        <Link to="/adminquery" className={`${isActive("adminquery") && "text-green-700 font-bold"}`}>Queries</Link>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* LOGOUT */}
        <Link
          to="/adminlogin"
          onClick={handleLogout}
          className="hidden md:block px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition text-sm font-semibold"
        >
          Logout
        </Link>

        {/* HAMBURGER (MOBILE) */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-green-100 shadow-md flex flex-col items-center gap-4 py-6 md:hidden">

          <Link to="/admindashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/adminworker" onClick={() => setMenuOpen(false)}>Workers</Link>
          <Link to="/adminuser" onClick={() => setMenuOpen(false)}>Users</Link>
          <Link to="/adminrequest" onClick={() => setMenuOpen(false)}>Requests</Link>
          <Link to="/adminreport" onClick={() => setMenuOpen(false)}>Reports</Link>
          <Link to="/adminquery" onClick={() => setMenuOpen(false)}>Queries</Link>

          <Link to="/adminlogin" onClick={() => { setMenuOpen(false); handleLogout(); }}
          className="px-4 py-2 rounded-full bg-green-500 text-white">Logout</Link>
      </div>
      )}

    </nav>
  );
}