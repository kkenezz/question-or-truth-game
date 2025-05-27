import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  id, 
  className,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
          transition-colors ${className || ''}`}
        {...props}
      />
    </div>
  );
};

export default InputField;