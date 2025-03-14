import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormDataPath } from '../schema';

interface TextFieldProps {
  name: FormDataPath;
  label: string;
  required?: boolean;
  type?: 'text' | 'url' | 'email' | 'date';
  placeholder?: string;
  helpText?: string;
}

export default function TextField({
  name,
  label,
  required = false,
  type = 'text',
  placeholder,
  helpText,
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`
          block w-full px-4 py-3 rounded-lg border
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          transition-colors duration-200
          text-base
        `}
      />
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 