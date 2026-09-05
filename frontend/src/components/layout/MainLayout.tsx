import { Button, Layout, theme } from "antd";
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
          {isAdmin && <div className="admin-header-title">Operations overview</div>}
          <Button
            onClick={handleLogout}
            style={{
              margin: "auto 15px auto auto",
              backgroundColor: isAdmin ? "transparent" : "red",
              color: isAdmin ? "#ef654e" : "white",
              border: isAdmin ? "1px solid #ef654e" : "0",
              fontWeight: "700",
            }}
          >
            Logout
          </Button>
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
      </Layout>
    </Layout>
  );
};

export default MainLayout;
