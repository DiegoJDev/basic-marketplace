import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export default function Input({
  leftIcon,
  rightIcon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {leftIcon ? (
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          {leftIcon}
        </span>
      ) : null}
      <input
        className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-300 ${
          leftIcon ? "pl-9" : ""
        } ${rightIcon ? "pr-9" : ""} ${className ?? ""}`.trim()}
        {...props}
      />
      {rightIcon ? (
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
          {rightIcon}
        </span>
      ) : null}
    </div>
  );
}
