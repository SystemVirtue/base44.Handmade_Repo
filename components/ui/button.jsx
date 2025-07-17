import React from "react";

export const Button = ({ children, className, variant, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <button
      className={`${baseClasses} ${variantClass} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
