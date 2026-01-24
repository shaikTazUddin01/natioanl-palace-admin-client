import React from "react";
import { useFormContext } from "react-hook-form";

interface IProps {
  required?: boolean;
  name: string;
  label?: string;
  defaultvalue?: string;
  placeholdertext?: string;
}

const TDTextArea = ({
  name,
  label,
  required = false,
  defaultvalue,
  placeholdertext,
}: IProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={name}
        {...register(name, { required })}
        defaultValue={defaultvalue}
        placeholder={placeholdertext}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition
          ${errorMessage ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-[#390dff]`}
        rows={4}
      />

      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default TDTextArea;
