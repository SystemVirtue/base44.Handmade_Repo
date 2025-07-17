import React from "react";

export const Badge = ({ children, className, variant, ...props }) => {
  const baseClasses =
    "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
  const variants = {
    default: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800",
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <span
      className={`${baseClasses} ${variantClass} ${className || ""}`}
      {...props}
    >
      {children}
    </span>
  );
};
