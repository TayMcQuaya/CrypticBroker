'use client';

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
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
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [hasSavedDraft, setHasSavedDraft] = React.useState(false);
  const [serverStatus, setServerStatus] = React.useState<'online' | 'offline' | 'unknown'>('unknown');
  
  const methods = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, trigger, setValue, reset } = methods;

  // Check for saved draft on component mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('projectDraft');
    if (savedDraft) {
      setHasSavedDraft(true);
    }
  }, []);

  // Load draft from local storage
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('projectDraft');
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft) as FormData;
        reset(parsedDraft);
        toast.success('Draft loaded successfully');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast.error('Failed to load draft');
    }
  };

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

  // Save form as draft
  const saveDraft = async () => {
    try {
      setIsSavingDraft(true);
      // Get values without validation
      const data = methods.getValues();
      
      // Save to local storage only
      localStorage.setItem('projectDraft', JSON.stringify(data));
      
      // Set hasSavedDraft to true since we have a local copy
      setHasSavedDraft(true);
      
      // Show success message
      toast.success('Draft saved to your browser');
      
    } catch (error) {
      console.error('Error in saveDraft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
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
    
    // Use type assertion to handle the complex type conversion
    const isStepValid = await trigger(fields as unknown as Array<keyof FormData>);
    
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
    const checkServerStatus = async () => {
      try {
        // Try multiple health check endpoints
        const endpoints = ['/api/health', '/health', '/api/status', '/status'];
        let isOnline = false;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying health check endpoint: ${endpoint}`);
            // Simple ping to check if server is responding
            const response = await fetch(endpoint, { 
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(3000) // 3 second timeout per endpoint
            });
            
            if (response.ok) {
              console.log(`Server is online (${endpoint})`);
              isOnline = true;
              break;
            }
          } catch (endpointError) {
            console.log(`Endpoint ${endpoint} failed:`, endpointError);
            // Continue to next endpoint
          }
        }
        
        setServerStatus(isOnline ? 'online' : 'offline');
      } catch (error) {
        console.error('All server health checks failed:', error);
        setServerStatus('offline');
      }
    };
    
    // Initial check
    checkServerStatus();
    
    // Set up periodic health checks
    const intervalId = setInterval(() => {
      checkServerStatus();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Step title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {formSteps[currentStep].title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {formSteps[currentStep].description}
            </p>
            
            {/* Draft notification */}
            {hasSavedDraft && currentStep === 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                <p>You have a saved draft. Would you like to load it?</p>
                <button
                  type="button"
                  onClick={loadDraft}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                >
                  Load Draft
                </button>
              </div>
            )}
            
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
              <div className="flex gap-3">
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

                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                  className="
                    inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg
                    shadow-sm text-sm font-medium text-gray-700 bg-white
                    hover:bg-gray-50 hover:border-gray-400
                    transition-colors duration-200
                  "
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>
              </div>
            )}

            {currentStep === formSteps.length - 1 && (
              <>
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
                
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                  className="
                    inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg
                    shadow-sm text-sm font-medium text-gray-700 bg-white
                    hover:bg-gray-50 hover:border-gray-400
                    transition-colors duration-200
                  "
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>
              </>
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