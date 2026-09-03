import { Button, Layout, theme } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppDispatch } from "../../redux/hooks";
import { logoutUser } from "../../redux/features/auth/authSlice";

const { Header, Content } = Layout;

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Layout style={{ height: "100%" }}>
      <Sidebar />
      <Layout>
        <Header
          style={{
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            onClick={handleLogout}
            style={{
              margin: "auto 15px auto auto",
              backgroundColor: "red",
              color: "white",
              border: "0",
              fontWeight: "800",
            }}
          >
            Logout
          </Button>
        </Header>
        <Content style={{ margin: "24px 16px 0", minHeight: "100vh" }}>
          <div
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
