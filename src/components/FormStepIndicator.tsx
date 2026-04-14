
import React from 'react';
import { cn } from '@/lib/utils';

interface FormStepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
              disabled={!onStepClick || index > currentStep}
              className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all",
                index < currentStep ? "bg-primary text-white" : 
                index === currentStep ? "bg-primary text-white ring-4 ring-primary/20" : 
                "bg-gray-200 text-gray-500 cursor-not-allowed"
              )}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                index + 1
              )}
            </button>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "flex-1 h-1 mx-2",
                  index < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex items-center justify-between mt-2">
        {steps.map((step, index) => (
          <div key={`label-${index}`} className={cn(
            "text-xs font-medium px-1", 
            index <= currentStep ? "text-primary" : "text-gray-400"
          )}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormStepIndicator;
