import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormField from '../FormField';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  helpText?: string;
  placeholder?: string;
}

export default function SelectField({
  name,
  label,
  options,
  required = false,
  helpText,
  placeholder,
}: SelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <FormField
      label={label}
      required={required}
      error={errors[name]?.message as string}
      helpText={helpText}
    >
      <select
        {...register(name, {
          required: required ? 'This field is required' : false,
        })}
        className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="py-2">
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
} 