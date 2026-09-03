/* eslint-disable @typescript-eslint/no-explicit-any */
import { Row, Button, Typography } from "antd";
import PHForm from "../components/form/PHForm";
import PHInput from "../components/form/PHInput";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TError } from "../types";
import { useState } from "react";
import { useAppDispatch } from "../redux/hooks";
import { logoutUser } from "../redux/features/auth/authSlice";
import { useChangePasswordMutation } from "../redux/features/user/userManagement.api";

const ChangePassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [changePassword] = useChangePasswordMutation();

  const { Title } = Typography;

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const res = await changePassword(data);

      if (res?.data?.success) {
        toast.success(res.data?.message, { duration: 2000 });

        setTimeout(() => {
          toast.success("Now Login with New Password to continue", {
            duration: 5000,
          });
          dispatch(logoutUser());
          navigate("/login");
        }, 2150); // Wait for the first toast to disappear before showing the second
      } else {
        toast.error((res?.error as TError)?.data.message, { duration: 4000 });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Try again");
    }
  };

  // State to toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: "100vh",
        backgroundColor: "#f0f2f5", // Light background
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "#fff", // White form container
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Change Password
        </Title>

        <PHForm onSubmit={onSubmit}>
          {/* Old Password Field */}
          <div style={{ marginBottom: "16px" }}>
            <PHInput type="text" name="oldPassword" label="Old Password" />
            {/* Show Password Button */}
          </div>

          {/* New Password Field */}
          <div style={{ marginBottom: "16px" }}>
            <PHInput
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              label="New Password"
            />
            {/* Show Password Button */}
            <Button
              type="link"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                marginTop: "8px",
                padding: "0",
                fontSize: "14px",
                color: "#1890ff",
                textAlign: "right",
                display: "block",
                width: "100%",
              }}
            >
              {showNewPassword ? "Hide Password" : "Show Password"}
            </Button>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{
              marginTop: "20px",
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
              fontSize: "16px",
              padding: "10px",
            }}
          >
            Submit
          </Button>
        </PHForm>
      </div>
    </Row>
  );
};

export default ChangePassword;
