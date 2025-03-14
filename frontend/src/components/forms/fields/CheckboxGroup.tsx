import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormField from '../FormField';

interface Option {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  helpText?: string;
  columns?: 1 | 2 | 3 | 4;
}

export default function CheckboxGroup({
  name,
  label,
  options,
  required = false,
  helpText,
  columns = 1,
}: CheckboxGroupProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <FormField
      label={label}
      required={required}
      error={errors[name]?.message as string}
      helpText={helpText}
    >
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 text-sm"
          >
            <input
              type="checkbox"
              value={option.value}
              {...register(name, {
                required: required ? 'Please select at least one option' : false,
              })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
} 