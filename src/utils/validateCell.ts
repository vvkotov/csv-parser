import { PIPELINE_STAGES, type PipelineStage } from "../types/pipelineStage";
import type { ValidationResult } from "../types/validationResult";

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim())
    ? { isValid: true }
    : { isValid: false, message: "Invalid email format" };
};

export const validateRequired = (
  value: string,
  fieldName: string
): ValidationResult => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validatePipelineStage = (stage: string): ValidationResult => {
  if (!stage || stage.trim() === "") {
    return { isValid: false, message: "Pipeline stage is required" };
  }
  return PIPELINE_STAGES.includes(stage.toLowerCase() as PipelineStage)
    ? { isValid: true }
    : {
        isValid: false,
        message: `Must be one of: ${PIPELINE_STAGES.join(", ")}`,
      };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === "") {
    return { isValid: true }; // Phone is optional
  }
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
    ? { isValid: true }
    : { isValid: false, message: "Invalid phone format" };
};
