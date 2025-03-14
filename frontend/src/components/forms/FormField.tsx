import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactElement<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  helpText?: string;
}

export default function FormField({
  label,
  required = false,
  error = null,
  children,
  helpText,
}: FormFieldProps) {
  const id = React.useId();

  // Create a new props object with the additional properties
  const childProps = {
    ...children.props,
    id,
    'aria-describedby': error ? `${id}-error` : helpText ? `${id}-description` : undefined,
    className: `${children.props.className || ''} ${
      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
    }`.trim(),
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        {React.cloneElement(children, childProps)}
      </div>
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500" id={`${id}-description`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
} 