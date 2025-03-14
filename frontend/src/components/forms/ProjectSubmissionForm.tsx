import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
import { formSchema, FormData } from './schema';
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
    id: 'general',
    title: 'General Information',
    description: 'Basic project details and team information',
    component: GeneralInfoStep,
  },
  {
    id: 'tge',
    title: 'TGE Details',
    description: 'Token generation event information',
    component: TGEDetailsStep,
  },
  {
    id: 'funding',
    title: 'Funding & Investment',
    description: 'Funding history and current needs',
    component: FundingStep,
  },
  {
    id: 'technical',
    title: 'Technical Details',
    description: 'Product and technical information',
    component: TechnicalDetailsStep,
  },
  {
    id: 'services',
    title: 'Services & Support',
    description: 'Additional services and support needed',
    component: ServicesStep,
  },
  {
    id: 'compliance',
    title: 'Compliance & Legal',
    description: 'Legal and regulatory information',
    component: ComplianceStep,
  },
];

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
  const handleFileUpload = async (file: File, field: keyof FormData) => {
    try {
      const response = await uploadFile(file);
      setValue(field, response.data.file.path);
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
      general: ['projectName', 'websiteUrl', 'pitchDeckUrl', 'founders', 'jurisdiction'],
      tge: ['tgeDate', 'listingExchanges', 'marketMaker', 'tokenomics'],
      funding: ['previousFunding', 'fundingTarget', 'investmentType', 'interestedVCs', 'keyMetrics'],
      technical: ['blockchain', 'otherBlockchain', 'features', 'techStack', 'security'],
      services: ['requiredServices', 'serviceDetails', 'additionalServices'],
      compliance: ['companyStructure', 'regulatoryCompliance', 'legalAdvisor', 'complianceStrategy', 'riskFactors'],
    };
    
    const fields = stepFields[formSteps[currentStep].id as keyof typeof stepFields] as Array<keyof FormData>;
    const isStepValid = await trigger(fields);
    
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress bar */}
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {formSteps.map((step, index) => (
              <div
                key={step.id}
                className={`${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                Step {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Step title */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {formSteps[currentStep].title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {formSteps[currentStep].description}
          </p>
        </div>

        {/* Current step form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <CurrentStepComponent onFileUpload={handleFileUpload} />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={saveDraft}
              disabled={isSavingDraft}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiSave className="mr-2 h-4 w-4" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          <button
            type={currentStep === formSteps.length - 1 ? 'submit' : 'button'}
            onClick={currentStep === formSteps.length - 1 ? undefined : nextStep}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
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
    </FormProvider>
  );
} 