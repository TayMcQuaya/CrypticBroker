import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormField from '../FormField';

interface TextAreaProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  rows?: number;
  validation?: {
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
  };
}

export default function TextArea({
  name,
  label,
  required = false,
  placeholder,
  helpText,
  rows = 4,
  validation = {},
}: TextAreaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const finalValidation = {
    required: required ? 'This field is required' : false,
    ...validation,
  };

  return (
    <FormField
      label={label}
      required={required}
      error={errors[name]?.message as string}
      helpText={helpText}
    >
      <textarea
        {...register(name, finalValidation)}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </FormField>
  );
} 