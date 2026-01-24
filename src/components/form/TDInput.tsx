import { useFormContext } from "react-hook-form";

interface IProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?:string
}

const TDInput = ({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: IProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, { required })}
        className={`border rounded-md px-3 py-2 outline-none
          ${errors[name] ? "border-red-500" : "border-gray-300"}
        `}
      />

      {errors[name] && (
        <span className="text-xs text-red-500">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
};

export default TDInput;
