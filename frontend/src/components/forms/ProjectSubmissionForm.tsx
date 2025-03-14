'use client';

import React, { useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { formSchema, FormData, FormDataPath } from './schema';
import { uploadFile, submitProject } from '../../utils/api';
import { toast } from 'react-hot-toast';

// Import form steps
import GeneralInfoStep from './steps/GeneralInfoStep';
import TGEDetailsStep from './steps/TGEDetailsStep';
import FundingStep from './steps/FundingStep';
import TechnicalDetailsStep from './steps/TechnicalDetailsStep';
import ServicesStep from './steps/ServicesStep';
import ComplianceStep from './steps/ComplianceStep';

// Form steps configuration - easy to modify
const formSteps = [
  {
    id: 'generalInfo' as const,
    title: 'General Information',
    description: 'Basic project details and team information',
    component: GeneralInfoStep,
  },
  {
    id: 'tgeDetails' as const,
    title: 'TGE Details',
    description: 'Token generation event information',
    component: TGEDetailsStep,
  },
  {
    id: 'funding' as const,
    title: 'Funding & Investment',
    description: 'Funding history and current needs',
    component: FundingStep,
  },
  {
    id: 'technical' as const,
    title: 'Technical Details',
    description: 'Product and technical information',
    component: TechnicalDetailsStep,
  },
  {
    id: 'services' as const,
    title: 'Services & Support',
    description: 'Additional services and support needed',
    component: ServicesStep,
  },
  {
    id: 'compliance' as const,
    title: 'Compliance & Legal',
    description: 'Legal and regulatory information',
    component: ComplianceStep,
  },
] as const;

export default function ProjectSubmissionForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState<Date | null>(null);
  const [serverStatus, setServerStatus] = React.useState<'online' | 'offline' | 'unknown'>('unknown');
  
  const methods = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, trigger, setValue, reset, watch, getValues } = methods;

  // Watch for form changes to enable auto-save
  const formValues = watch();
  
  // Type guard to ensure data is a valid FormData object
  const isValidFormData = (data: unknown): data is FormData => {
    return (
      data !== null &&
      typeof data === 'object' &&
      Object.keys(data).length > 0
    );
  };

  // Initialize form with default values and check for saved draft
  React.useEffect(() => {
    console.log('Checking for saved draft...');
    const savedDraft = localStorage.getItem('projectDraft');
    
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        console.log('Found saved draft:', parsedDraft);
        
        if (isValidFormData(parsedDraft)) {
          // Update saved time if available
          const savedTime = localStorage.getItem('projectDraftSavedTime');
          if (savedTime) {
            setLastSavedTime(new Date(savedTime));
            console.log('Last saved time:', savedTime);
          }
          
          // If we're on the first step, pre-populate the form
          if (currentStep === 0) {
            console.log('On first step, pre-populating form...');
            
            // Reset form with saved data
            reset(parsedDraft);
            
            // Set each field individually
            Object.entries(parsedDraft).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                setValue(key as keyof FormData, value);
              }
            });
            
            console.log('Form values after pre-population:', methods.getValues());
          }
        } else {
          console.error('Invalid draft data format');
          throw new Error('Invalid draft data format');
        }
      } catch (error) {
        console.error('Error parsing saved draft:', error);
        // Clear invalid draft data
        localStorage.removeItem('projectDraft');
        localStorage.removeItem('projectDraftSavedTime');
      }
    } else {
      console.log('No saved draft found');
    }
  }, [currentStep, reset, setValue, methods]);
  
  // Save form as draft - wrapped in useCallback
  const saveDraft = useCallback(async () => {
    try {
      // Get values without validation
      const data = getValues();
      
      // Debug: Log what we're trying to save
      console.log('Attempting to save draft:', data);
      
      // Check if the data is different from the last saved draft
      const lastSavedDraft = localStorage.getItem('projectDraft');
      if (lastSavedDraft && JSON.stringify(data) === lastSavedDraft) {
        return;
      }
      
      // Save to local storage
      localStorage.setItem('projectDraft', JSON.stringify(data));
      localStorage.setItem('projectDraftSavedTime', new Date().toISOString());
      
      // Debug: Verify save
      console.log('Draft saved. Verification:', localStorage.getItem('projectDraft'));
      
      // Update state
      setLastSavedTime(new Date());
      
    } catch (error) {
      console.error('Error in saveDraft:', error);
    }
  }, [getValues]);

  // Auto-save when form values change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(formValues).length > 0) {
        saveDraft();
      }
    }, 2000); // Auto-save 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [formValues, saveDraft]);

  // Handle file uploads
  const handleFileUpload = async (file: File, field: FormDataPath) => {
    try {
      const response = await uploadFile(file);
      setValue(field, response.data.file.path, { shouldValidate: true });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Save to local storage as backup
      localStorage.setItem('projectSubmission', JSON.stringify(data));
      
      try {
        const response = await submitProject(data, 'SUBMITTED');
        
        // Check if this was a mock success (local storage only)
        if (response.data && typeof response.data === 'object' && 'message' in response.data && 
            typeof response.data.message === 'string' && response.data.message.includes('Mock success')) {
          toast.success('Project saved locally');
          toast.error('Server connection failed - submission may not be processed');
          setServerStatus('offline');
        } else {
          toast.success('Project submitted successfully');
          setServerStatus('online');
        }
      } catch (error: unknown) {
        console.error('Error submitting project to server:', error);
        
        // Show more detailed error message
        const err = error as { response?: { status?: number }, code?: string, message?: string };
        if (err.response?.status === 500) {
          toast.error('Could not submit to server: Internal server error');
          setServerStatus('offline');
        } else if (err.response?.status === 401) {
          toast.error('Could not submit to server: Authentication error');
          // Don't set offline for auth errors
        } else if (err.code === 'ECONNABORTED') {
          toast.error('Could not submit to server: Request timed out');
          setServerStatus('offline');
        } else {
          toast.error(`Could not submit to server: ${err.message || 'Unknown error'}`);
          setServerStatus('offline');
        }
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      
      // Check if we at least saved to localStorage
      if (localStorage.getItem('projectSubmission')) {
        toast.success('Project saved locally');
        toast.error('Failed to submit to server - please try again later');
      } else {
        toast.error('Failed to submit project');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const stepFields = {
      generalInfo: ['generalInfo.projectName', 'generalInfo.websiteUrl', 'generalInfo.pitchDeckUrl', 'generalInfo.coreFounders', 'generalInfo.projectHQ'],
      tgeDetails: ['tgeDetails.tgeDate', 'tgeDetails.listingExchanges', 'tgeDetails.totalSupply', 'tgeDetails.circulatingSupply', 'tgeDetails.vestingSchedule'],
      funding: ['funding.previousFunding', 'funding.fundingTarget', 'funding.investmentType', 'funding.keyMetrics'],
      technical: ['technical.blockchain', 'technical.features', 'technical.techStack', 'technical.security'],
      services: ['services.requiredServices', 'services.serviceDetails'],
      compliance: ['compliance.companyStructure', 'compliance.regulatoryCompliance', 'compliance.complianceStrategy', 'compliance.riskFactors'],
    } as const;
    
    const currentId = formSteps[currentStep].id;
    const fields = stepFields[currentId as keyof typeof stepFields];
    
    // Debug validation errors
    const { errors } = methods.formState;
    console.log('Current form errors:', errors);
    
    // Log current form values for debugging
    const currentValues = methods.getValues();
    console.log('Current form values:', currentValues);
    
    // Validate all fields in the current section
    const validationPromises = fields.map(field => trigger(field as keyof FormData));
    const validationResults = await Promise.all(validationPromises);
    const isStepValid = validationResults.every(result => result);
    
    console.log('Step validation result:', isStepValid);
    
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, formSteps.length - 1));
    } else {
      // Show validation errors to the user
      toast.error('Please fill in all required fields correctly');
      console.log('Validation failed for fields:', fields);
      
      // Log specific field errors
      fields.forEach(field => {
        console.log(`Checking field: ${field}`);
        // Just log the entire errors object - simpler approach
        console.log('All form errors:', methods.formState.errors);
      });
      
      // Scroll to the form
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = formSteps[currentStep].component;

  // Check server status on component mount
  React.useEffect(() => {
    let isComponentMounted = true;
    
    const checkServerStatus = async () => {
      try {
        // Only try the main health endpoint
        const response = await fetch('/api/health', { 
          method: 'HEAD', // Use HEAD instead of GET - we don't need the response body
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(2000), // Shorter timeout
          cache: 'no-store' // Prevent caching
        });
        
        if (isComponentMounted) {
          setServerStatus(response.ok ? 'online' : 'offline');
        }
      } catch (error) {
        if (isComponentMounted) {
          console.error('Health check failed:', error);
          setServerStatus('offline');
        }
      }
    };
    
    // Initial check
    checkServerStatus();
    
    // Less frequent checks
    const intervalId = setInterval(checkServerStatus, 60000); // Check every minute instead of 30 seconds
    
    // Cleanup
    return () => {
      isComponentMounted = false;
      clearInterval(intervalId);
    };
  }, []); // No dependencies needed since we're not using any state variables in the interval

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex justify-between items-center text-white">
            <h1 className="text-xl font-semibold">Submit Your Project</h1>
            <span className="text-sm">Step {currentStep + 1} of {formSteps.length}</span>
          </div>
          
          {/* Server status indicator */}
          {serverStatus === 'offline' && (
            <div className="mt-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-red-300 rounded-full mr-2 animate-pulse"></span>
              <span>Server connection lost - Your data will be saved locally</span>
            </div>
          )}
          {serverStatus === 'unknown' && (
            <div className="mt-2 bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full mr-2 animate-pulse"></span>
              <span>Checking server connection...</span>
            </div>
          )}
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="overflow-hidden h-2 rounded-full bg-blue-900/30">
              <div
                style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
                className="h-full bg-white rounded-full transition-all duration-500 ease-in-out"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-blue-100">
              {formSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`${
                    index <= currentStep 
                      ? 'text-white font-medium' 
                      : 'text-blue-200'
                  } transition-all duration-300`}
                >
                  Step {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="px-6 py-2 bg-gray-50 text-sm flex items-center justify-between">
          <span className="text-blue-600">
            Your entries are automatically saved as you type
          </span>
          {lastSavedTime && (
            <span className="text-gray-600">
              Last saved: {lastSavedTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Step title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {formSteps[currentStep].title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {formSteps[currentStep].description}
            </p>
            
            {/* Offline mode explanation */}
            {serverStatus === 'offline' && currentStep === 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                <p className="font-semibold">Server Connection Issue Detected</p>
                <p className="mt-1">The application is currently running in offline mode. Your data will be saved to your browser&apos;s local storage.</p>
                <p className="mt-1">When the server connection is restored, you can submit your project.</p>
                <p className="mt-1 text-xs">Technical details: The server endpoints are returning errors (404/500). This could be due to server maintenance or network issues.</p>
              </div>
            )}
          </div>

          {/* Current step form */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <CurrentStepComponent onFileUpload={handleFileUpload} />
          </div>

          {/* Navigation buttons */}
          <div className={`flex ${currentStep === formSteps.length - 1 ? 'justify-center gap-4' : 'justify-between'} pt-4 border-t border-gray-200`}>
            {currentStep !== formSteps.length - 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`
                  inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </button>
            )}

            {currentStep === formSteps.length - 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="
                  inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg
                  shadow-sm text-sm font-medium text-gray-700 bg-white
                  hover:bg-gray-50 hover:border-gray-400
                  transition-colors duration-200
                "
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </button>
            )}

            <button
              type={currentStep === formSteps.length - 1 ? 'submit' : 'button'}
              onClick={currentStep === formSteps.length - 1 ? undefined : () => {
                console.log('Next button clicked');
                nextStep();
              }}
              disabled={isSubmitting}
              className={`
                inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium
                text-white bg-blue-600 hover:bg-blue-700
                disabled:bg-blue-400 disabled:cursor-not-allowed
                transition-colors duration-200
                shadow-sm
                ${currentStep === formSteps.length - 1 ? 'px-8 py-3' : ''}
              `}
            >
              {currentStep === formSteps.length - 1 ? (
                <>
                  <FiCheck className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </>
              ) : (
                <>
                  Next
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
} 