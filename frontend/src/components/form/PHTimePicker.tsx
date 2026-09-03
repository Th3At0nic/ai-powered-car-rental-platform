import { TimePicker, Form } from "antd";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";

type TPHTimePickerProps = {
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
};

const PHTimePicker = ({
  name,
  label,
  disabled,
  required,
}: TPHTimePickerProps) => {
  return (
    <Controller
      name={name}
      render={({ field, fieldState: { error } }) => (
        <Form.Item label={label} required={required}>
          <TimePicker
            style={{ width: "100%" }}
            {...field}
            // id={name}
            disabled={disabled}
            format="HH:mm"
            // When field.value is dayjs, format it as a string; otherwise use null
            value={field.value ? dayjs(field.value, "HH:mm") : null}
            onChange={(timeValue) => {
              const formattedTime = timeValue
                ? timeValue.format("HH:mm")
                : null;
              field.onChange(formattedTime); // Send formatted time to the form state
            }}
          />
          {error && <small style={{ color: "red" }}>{error.message}</small>}
        </Form.Item>
      )}
    />
  );
};

export default PHTimePicker;
