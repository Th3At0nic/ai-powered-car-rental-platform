/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Row, Typography } from "antd";
import { FieldValues } from "react-hook-form";
import { useLoginMutation } from "../redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser, TUserFromToken } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PHForm from "../components/form/PHForm";
import PHInput from "../components/form/PHInput";
import { useState } from "react";
import { verifyToken } from "../utils/verifyToken";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { Title } = Typography;

  const [login] = useLoginMutation();

  const onSubmit = async (formData: FieldValues) => {
    const toastId = toast.loading("Logging in...");
    try {
      const userInfo = {
        email: formData.email,
        password: formData.password,
      };
      const res = await login(userInfo).unwrap();

      const user = verifyToken(res.data.accessToken) as TUserFromToken;

      dispatch(setUser({ user: user, token: res.data.accessToken }));

      toast.success("Logged in successfully", { id: toastId, duration: 2000 });

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(`Something went wrong`, {
        id: toastId,
        duration: 2000,
      });
    }
  };

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Toggle the password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: "100vh",
        backgroundColor: "#f0f2f5", // Light background to make the form stand out
        padding: "20px", // Adds padding around the content
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "#fff", // White background for the form container
          padding: "30px",
          borderRadius: "8px", // Rounded corners
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for a modern look
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Login to Your Account
        </Title>

        <PHForm onSubmit={onSubmit}>
          {/* ID Field */}
          <div style={{ marginBottom: "16px" }}>
            <PHInput type="text" name="email" label="Email" />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "16px" }}>
            <PHInput
              type={showPassword ? "text" : "password"}
              name="password"
              label="Password"
            />
            {/* Show Password Button */}
            <Button
              type="link"
              onClick={togglePasswordVisibility}
              style={{
                marginTop: "8px",
                padding: "0",
                fontSize: "14px",
                color: "#1890ff", // Blue color to match Ant Design's link style
                textAlign: "right",
                display: "block", // To ensure it's below the input
                width: "100%",
              }}
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </Button>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{
              marginTop: "20px",
              backgroundColor: "#1890ff", // Primary button color (blue)
              borderColor: "#1890ff", // Border color to match button
              fontSize: "16px", // Slightly larger text
              padding: "10px", // Adds padding inside the button
            }}
          >
            Login
          </Button>
        </PHForm>
      </div>
    </Row>
  );
};

export default Login;
