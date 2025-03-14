import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import FormField from '../FormField';

interface FileUploadFieldProps {
  name: string;
  label: string;
  required?: boolean;
  accept?: string;
  helpText?: string;
  onFileSelect: (file: File) => Promise<void>;
}

export default function FileUploadField({
  name,
  label,
  required,
  accept,
  helpText,
  onFileSelect,
}: FileUploadFieldProps) {
  const { register, watch } = useFormContext();
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const value = watch(name);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      await onFileSelect(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      await onFileSelect(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const { ref: registerRef, onChange: registerOnChange, ...registerRest } = register(name);

  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          error ? 'border-red-300' : 'border-gray-300'
        } hover:border-gray-400 transition-colors`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          ref={(e) => {
            registerRef(e);
            fileInputRef.current = e;
          }}
          onChange={(e) => {
            registerOnChange(e);
            handleFileChange(e);
          }}
          {...registerRest}
        />

        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiFile className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{value}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isUploading ? 'Uploading...' : 'Choose file'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              or drag and drop your file here
            </p>
          </div>
        )}
      </div>
    </FormField>
  );
} 