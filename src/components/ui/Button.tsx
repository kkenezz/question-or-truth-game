import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  icon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  icon,
  className,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  
  const variantStyles = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
    secondary: "bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };
  
  const widthStyles = fullWidth ? "w-full" : "";
  
  const disabledStyles = props.disabled
    ? "opacity-50 cursor-not-allowed"
    : "hover:transform hover:scale-[1.03] active:scale-[0.97]";
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className || ''}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
};

export default Button;