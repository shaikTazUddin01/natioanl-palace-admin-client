import { useFormContext } from "react-hook-form";

interface IOption {
  label: string;
  value: string;
}

interface IProps {
  required?: boolean;
  name: string;
  label: string;
  options: IOption[];
  size?: "sm" | "md" | "lg";
  defaultValue?: string | undefined;
  placeholder?:string
}

const TDSelect = ({
  name,
  label,
  options,
  size = "md",
  defaultValue,
  required = false
}: IProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <div className="w-full space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        {...register(name, { required })}
        defaultValue={defaultValue}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition ${
          errorMessage ? "border-red-500" : "border-gray-300"
        } focus:ring-2 focus:ring-[#390dff]`}
      
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default TDSelect;
