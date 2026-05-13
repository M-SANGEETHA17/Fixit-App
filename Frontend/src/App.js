import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Home from './UserComponent/Home';
import Register from './UserComponent/Register';
import Login from './UserComponent/Login';

import Workerlogin from './WorkerComponent/Workerlogin';
import WorkerRegister from './WorkerComponent/WorkerRegister';
import WorkerNavbar from './WorkerComponent/WorkerNavbar';
import WorkerContact from './WorkerComponent/WorkerContact';
import WorkerDashboard from './WorkerComponent/WorkerDashboard';
import WorkerRequest from './WorkerComponent/WorkerRequest';
import WorkerProfile from './WorkerComponent/WorkerProfile';

import HomeCleaning from './UserComponent/services/homeclean';
import ACservice from './UserComponent/services/ACservice';
import ElectricalRepair from './UserComponent/services/electricalrepair';
import Plumbing from './UserComponent/services/plumbingser';
import Pestcontrol from './UserComponent/services/Pestcontrol';
import Carpentrywork from './UserComponent/services/Carpentrywork';

import Contact from './UserComponent/Contact';
import StatsSection from './UserComponent/StatsSection';
import Footer from './UserComponent/Footer';
import Cmpy from './UserComponent/About/Cmpy';

import Navbar from "./UserComponent/Navbar";

import AdminNavbar from "./AdminComponent/AdminNavbar";
import AdminLogin from "./AdminComponent/AdminLogin";
import AdminDashboard from "./AdminComponent/AdminDashboard";
import AdminWorker from "./AdminComponent/AdminWorker";
import AdminRequest from "./AdminComponent/AdminRequest";
import AdminReport from "./AdminComponent/AdminReport";
import AdminQuery from "./AdminComponent/AdminQuery";
import AdminUser from "./AdminComponent/AdminUser";

import './index.css';
import AdminQueries from "./AdminComponent/AdminQuery";

const PrivateRoute = ({ children }) => {
  const worker = JSON.parse(localStorage.getItem("worker"));
  if (!worker) return <Navigate to="/workerlogin" />;
  return children;
};

const AdminPrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
  if (!isAuthenticated) return <Navigate to="/adminlogin" replace />;
  return children;
};

function Layout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  let NavbarToShow;

  if (path.startsWith("/admin")) {
    NavbarToShow = <AdminNavbar />;
  } else if (path.startsWith("/worker")) {
    NavbarToShow = <WorkerNavbar />;
  } else {
    NavbarToShow = <Navbar />;
  }

  return (
    <div>
      {NavbarToShow}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/homecleaning" element={<HomeCleaning />} />
        <Route path="/electricalrepair" element={<ElectricalRepair />} />
        <Route path="/plumbing" element={<Plumbing />} />
        <Route path="/acservice" element={<ACservice />} />
        <Route path="/pestcontrol" element={<Pestcontrol />} />
        <Route path="/carpentry" element={<Carpentrywork />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/stats" element={<StatsSection />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/cmpy" element={<Cmpy />} />

        <Route path="/workerlogin" element={<Workerlogin />} />
        <Route path="/workerregister" element={<WorkerRegister />} />

        <Route path="/workerdashboard" element={<PrivateRoute><WorkerDashboard /></PrivateRoute>} />
        <Route path="/workerrequests" element={<PrivateRoute><WorkerRequest /></PrivateRoute>} />
        <Route path="/workerprofiles" element={<PrivateRoute><WorkerProfile /></PrivateRoute>} />
        <Route path="/workercontact" element={<WorkerContact />} />

        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
        <Route path="/adminworker" element={<AdminPrivateRoute><AdminWorker /></AdminPrivateRoute>} />
        <Route path="/adminrequest" element={<AdminPrivateRoute><AdminRequest /></AdminPrivateRoute>} />
        <Route path="/adminreport" element={<AdminPrivateRoute><AdminReport /></AdminPrivateRoute>} />
        <Route path="/adminquery" element={<AdminPrivateRoute><AdminQuery /></AdminPrivateRoute>} />
        <Route path="/adminuser" element={<AdminPrivateRoute><AdminUser /></AdminPrivateRoute>} />



      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;