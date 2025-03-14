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
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
} 