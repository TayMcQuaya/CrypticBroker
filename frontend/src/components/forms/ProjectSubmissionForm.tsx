'use client';

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
import { formSchema, FormData, FormDataPath } from './schema';
import { uploadFile } from '../../utils/api';
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
  
  const methods = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, trigger, setValue } = methods;

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
      const formData = methods.getValues();
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'DRAFT',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Submit form data to API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'SUBMITTED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast.success('Project submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit project');
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
    // Use type assertion to handle the complex type conversion
    const isStepValid = await trigger(fields as unknown as Array<keyof FormData>);
    
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, formSteps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = formSteps[currentStep].component;

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="flex justify-between items-center text-white">
            <h1 className="text-xl font-semibold">Submit Your Project</h1>
            <span className="text-sm">Step {currentStep + 1} of {formSteps.length}</span>
          </div>
          
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
                    index <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
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
          </div>

          {/* Current step form */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <CurrentStepComponent onFileUpload={handleFileUpload} />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
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

            <button
              type={currentStep === formSteps.length - 1 ? 'submit' : 'button'}
              onClick={currentStep === formSteps.length - 1 ? undefined : nextStep}
              disabled={isSubmitting}
              className="
                inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium
                text-white bg-blue-600 hover:bg-blue-700
                disabled:bg-blue-400 disabled:cursor-not-allowed
                transition-colors duration-200
                shadow-sm
              "
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