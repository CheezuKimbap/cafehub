import React, { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; // optional label
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col w-full">
      <input
        className={`input my-2 bg-white text-[#ACACAC] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E4430] ${className}`}
        {...props}
      />
    </div>
  );
};
