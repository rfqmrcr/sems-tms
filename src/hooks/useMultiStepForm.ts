
import { useState } from 'react';

/**
 * Custom hook for managing multi-step forms
 * @param steps Array of step indices
 * @param initialStep Starting step index
 * @returns Object containing methods and state for multi-step form navigation
 */
export function useMultiStepForm(steps: number[], initialStep = 0) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);

  /**
   * Go to the next step if not at the last step
   * @returns void
   */
  function nextStep() {
    setCurrentStepIndex(i => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
  }

  /**
   * Go to the previous step if not at the first step
   * @returns void
   */
  function prevStep() {
    setCurrentStepIndex(i => {
      if (i <= 0) return i;
      return i - 1;
    });
  }

  /**
   * Go to a specific step by index
   * @param index The step index to go to
   * @returns void
   */
  function goToStep(index: number) {
    // Only allow going to steps that exist
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    steps,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    goToStep,
    nextStep,
    prevStep
  };
}
