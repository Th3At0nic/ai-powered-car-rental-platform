import { Avatar, Button, Input, Layout, Space, Tooltip, theme } from "antd";
import { BellOutlined, LogoutOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppDispatch } from "../../redux/hooks";
import { logoutUser } from "../../redux/features/auth/authSlice";

const { Header, Content } = Layout;

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Layout className={isAdmin ? "admin-layout" : ""} style={{ height: "100%" }}>
      <Sidebar />
      <Layout>
        <Header
          className={isAdmin ? "admin-header" : ""}
          style={{
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {isAdmin ? (
            <>
              <Input className="admin-global-search" prefix={<SearchOutlined />} placeholder="Search dashboard" suffix={<kbd>⌘ K</kbd>} />
              <Space className="admin-header-actions" size={6}>
                <Tooltip title="Notifications"><Button type="text" aria-label="Notifications" icon={<BellOutlined />} /></Tooltip>
                <Tooltip title="Settings"><Button type="text" aria-label="Settings" icon={<SettingOutlined />} /></Tooltip>
                <Avatar size={30} className="admin-avatar">A</Avatar>
                <Button className="admin-logout" onClick={handleLogout} icon={<LogoutOutlined />}>Logout</Button>
              </Space>
            </>
          ) : <Button onClick={handleLogout}>Logout</Button>}
        </Header>
        <Content className={isAdmin ? "admin-content" : ""} style={{ margin: "24px 16px 0", minHeight: "100vh" }}>
          <div
            className={isAdmin ? "admin-content-inner" : ""}
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        {isAdmin && <footer className="admin-footer"><span>2026 © All Right Reserved</span><span>Designed &amp; Developed</span></footer>}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
