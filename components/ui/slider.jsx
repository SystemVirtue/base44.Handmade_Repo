import React from "react";

export const Slider = ({
  value = [0],
  onValueChange,
  max = 100,
  className,
  ...props
}) => {
  const handleChange = (e) => {
    const newValue = [parseInt(e.target.value)];
    onValueChange?.(newValue);
  };

  return (
    <input
      type="range"
      min="0"
      max={max}
      value={value[0] || 0}
      onChange={handleChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className || ""}`}
      {...props}
    />
  );
};
