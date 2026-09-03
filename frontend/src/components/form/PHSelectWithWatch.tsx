import { Form, Select } from "antd";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

type TPHSelectWithWatch = {
  label: string;
  name: string;
  options: { value: string; label: string; disabled?: boolean }[] | undefined;
  disabled?: boolean;
  defaultValue?: { value: string; label: string };
  mode?: "multiple" | "tags" | undefined;
  functionProp: (value: string) => void;
};

const PHSelectWithWatch = ({
  label,
  name,
  options,
  disabled,
  defaultValue,
  mode,
  functionProp,
}: TPHSelectWithWatch) => {
  const { setValue, control } = useFormContext(); // Accessing the form context

  const inputValue = useWatch({
    control,
    name,
  });

  useEffect(() => {
    if (inputValue !== undefined) {
      functionProp(inputValue); // Call onValueChange with inputValue
    } else {
      functionProp(""); // Handle undefined by passing an empty string
    }
  }, [inputValue, functionProp]);

  // Set default value using useEffect after render
  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue.value);
    }
  }, [defaultValue, setValue, name]);

  return (
    <Controller
      name={name}
      render={({ field, fieldState: { error } }) => (
        <Form.Item label={label}>
          <Select
            style={{ width: "100%" }}
            {...field}
            mode={mode}
            options={options}
            size="large"
            disabled={disabled}
          />
          {error && <small style={{ color: "red" }}>{error.message}</small>}
        </Form.Item>
      )}
    />
  );
};

export default PHSelectWithWatch;
