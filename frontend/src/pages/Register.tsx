import { Button, Form, Input, Row, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/features/auth/authApi";

type TRegisterForm = { fullName: string; email: string; password: string; confirmPassword: string };

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return "Unable to create your account. Please try again.";
};

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const onSubmit = async ({ fullName, email, password }: TRegisterForm) => {
    try {
      await register({ fullName, email, password }).unwrap();
      toast.success("Account created. You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Row justify="center" align="middle" className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">Drive<span>Pilot</span></Link>
        <p className="eyebrow">START YOUR JOURNEY</p>
        <Typography.Title level={2}>Create your account</Typography.Title>
        <p className="auth-intro">A better way to find your next drive.</p>
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Full name" name="fullName" rules={[{ required: true, whitespace: true, message: "Enter your full name." }]}>
            <Input size="large" autoComplete="name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Enter a valid email." }]}>
            <Input size="large" autoComplete="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6, message: "Use at least 6 characters." }]}>
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="Confirm password" name="confirmPassword" dependencies={["password"]} rules={[{ required: true, message: "Confirm your password." }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue("password") === value ? Promise.resolve() : Promise.reject(new Error("Passwords do not match.")); } })]}>
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>Create account</Button>
        </Form>
        <p className="auth-footer">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </Row>
  );
};

export default Register;
