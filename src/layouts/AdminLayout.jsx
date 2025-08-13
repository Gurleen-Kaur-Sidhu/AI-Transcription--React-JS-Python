import ContentTop from "../pages/Admin/layout/ContentTop";
import Sidebar from "../pages/Admin/layout/Sidebar";
import LoginForm from "../pages/Landing/LoginForm";
import "./adminlayout.css";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="main-content d-flex w-100 p-0 m-0">
      <Sidebar />
      {/* <LoginForm></LoginForm> */}
      <div className="w-100 p-3" id="admin_content">
        <ContentTop />
        <div className="main-content-holder">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
