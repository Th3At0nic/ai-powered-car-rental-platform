import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { BarChartOutlined, CarOutlined, DashboardOutlined, EnvironmentOutlined, FolderOpenOutlined, HomeOutlined, SettingOutlined, TagsOutlined, TeamOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { NavLink, useLocation } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import {
  TUserFromToken,
  userCurrentToken,
} from "../../redux/features/auth/authSlice";
import { verifyToken } from "../../utils/verifyToken";
import { sidebarItemsGenerator } from "../../utils/sidebarItemsGenerator";
import { userPaths } from "../../routes/userRoutes";

const { Sider } = Layout;

const userRole = {
  ADMIN: "admin",
  USER: "user",
};

export const Sidebar = () => {
  const token = useAppSelector(userCurrentToken);
  const location = useLocation();

  let user = null;

  if (token) {
    user = verifyToken(token) as TUserFromToken;
  }

  // Using `user!` to assert that `user` is never null or undefined at this point.
  // This should only be used when we're 100% sure `user` exists to avoid runtime errors.
  let sidebarItems: MenuProps["items"];

  switch (user?.role) {
    case userRole.ADMIN:
      sidebarItems = [
        { type: "group", label: "MAIN", children: [{ key: "/admin/dashboard", icon: <DashboardOutlined />, label: <NavLink to="/admin/dashboard">Dashboard</NavLink> }, { key: "super-admin", icon: <TeamOutlined />, label: "Super Admin", disabled: true }] },
        { type: "divider" },
        { type: "group", label: "FLEET", children: [{ key: "vehicles", icon: <CarOutlined />, label: "Vehicles", disabled: true }, { key: "categories", icon: <TagsOutlined />, label: "Categories", disabled: true }, { key: "brands", icon: <FolderOpenOutlined />, label: "Brands", disabled: true }, { key: "locations", icon: <EnvironmentOutlined />, label: "Locations", disabled: true }] },
        { type: "divider" },
        { type: "group", label: "RENTALS", children: [{ key: "rentals", icon: <UnorderedListOutlined />, label: "Rentals", disabled: true }, { key: "pending-rentals", icon: <HomeOutlined />, label: "Pending rentals", disabled: true }] },
        { type: "divider" },
        { type: "group", label: "REPORTS", children: [{ key: "analytics", icon: <BarChartOutlined />, label: "Analytics", disabled: true }, { key: "settings", icon: <SettingOutlined />, label: "Settings", disabled: true }] },
      ];
      break;
    case userRole.USER:
      sidebarItems = sidebarItemsGenerator(userPaths, userRole.USER);
      break;

    default:
      break;
  }

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{ height: "100vh", position: "sticky", top: "0", left: "0" }}
    >
      {/* Logo */}
      <div
        className="demo-logo-vertical"
        style={{
          color: "white",
          textAlign: "center",
          fontSize: "0.8rem",
          margin: "22px auto 28px",
        }}
      >
        <h1><span className="admin-brand-mark">D</span> DrivePilot</h1>
      </div>

      {/* Sidebar Menu - Takes Remaining Space */}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={sidebarItems}
      />
    </Sider>
  );
};

export default Sidebar;
