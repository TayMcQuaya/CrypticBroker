import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormField from '../FormField';

interface TextFieldProps {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'url' | 'email' | 'date';
  placeholder?: string;
  helpText?: string;
  validation?: {
    pattern?: {
      value: RegExp;
      message: string;
    };
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

const defaultValidation = {
  url: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: 'Please enter a valid URL starting with http:// or https://',
    },
  },
  email: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
};

export default function TextField({
  name,
  label,
  required = false,
  type = 'text',
  placeholder,
  helpText,
  validation = {},
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Combine default validation with custom validation
  const finalValidation = {
    required: required ? 'This field is required' : false,
    ...(defaultValidation[type as keyof typeof defaultValidation] || {}),
    ...validation,
  };

  return (
    <FormField
      label={label}
      required={required}
      error={errors[name]?.message as string}
      helpText={helpText}
    >
      <input
        type={type}
        {...register(name, finalValidation)}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </FormField>
  );
} 