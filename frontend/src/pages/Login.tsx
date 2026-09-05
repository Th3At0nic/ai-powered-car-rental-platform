import { Button, Form, Input, Row, Typography } from "antd";
import { useLoginMutation } from "../redux/features/auth/authApi";
import { useAppDispatch } from "../redux/hooks";
import { setUser } from "../redux/features/auth/authSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

type TLoginForm = { email: string; password: string };

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return "Unable to log in. Please check your details and try again.";
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { Title } = Typography;

  const [login] = useLoginMutation();

  const onSubmit = async (formData: TLoginForm) => {
    const toastId = toast.loading("Logging in...");
    try {
      const res = await login(formData).unwrap();
      dispatch(setUser({
        user: res.data.user,
        token: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      }));

      toast.success("Logged in successfully", { id: toastId, duration: 2000 });

      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(destination || (res.data.user.role === "admin" ? "/admin/dashboard" : "/"));
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: toastId,
        duration: 2000,
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Row justify="center" align="middle" className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">Drive<span>Pilot</span></Link>
        <p className="eyebrow">WELCOME BACK</p>
        <Title level={2}>Log in to your account</Title>
        <p className="auth-intro">Pick up where your next journey begins.</p>
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Enter a valid email." }]}>
            <Input size="large" autoComplete="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password." }]}>
            <Input.Password size="large" visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">Log in</Button>
        </Form>
        <p className="auth-footer">New to DrivePilot? <Link to="/register">Create an account</Link></p>
      </div>
    </Row>
  );
};

export default Login;
