import { Form, Input } from "antd";
import { Controller } from "react-hook-form";

type TPHImageInputProps = {
  name: string;
  label: string;
};

const PHImageInput = ({ name, label }: TPHImageInputProps) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <Controller
        name={name}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => (
          <Form.Item label={label}>
            <Input
              type="file"
              value={value?.fileName}
              {...field}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onChange(file); // Update form state with selected file
              }}
            />
            {error && <small style={{ color: "red" }}>{error.message}</small>}
          </Form.Item>
        )}
      />
    </div>
  );
};

export default PHImageInput;
