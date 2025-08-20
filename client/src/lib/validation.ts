// Password strength validation utility
export interface PasswordStrength {
  score: number; // 0-4 (weak to strong)
  label: string;
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  let score: number;
  let label: string;
  let color: string;

  if (passedChecks === 0 || password.length === 0) {
    score = 0;
    label = "Enter password";
    color = "gray";
  } else if (passedChecks <= 2) {
    score = 1;
    label = "Very weak";
    color = "red";
  } else if (passedChecks === 3) {
    score = 2;
    label = "Weak";
    color = "orange";
  } else if (passedChecks === 4) {
    score = 3;
    label = "Good";
    color = "yellow";
  } else {
    score = 4;
    label = "Strong";
    color = "green";
  }

  return { score, label, color, checks };
}

// Email validation
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  if (email.length > 254) {
    return { isValid: false, error: "Email address is too long" };
  }

  return { isValid: true };
}

// Check if all required fields are filled and valid
export function areRequiredFieldsFilled(
  fields: Record<string, any>,
  requiredFields: string[],
  validationResults?: Record<string, { isValid: boolean }>
): boolean {
  // Check if all required fields have values
  const hasAllValues = requiredFields.every(field => {
    const value = fields[field];
    return value !== null && value !== undefined && value !== "";
  });

  if (!hasAllValues) return false;

  // Check validation results if provided
  if (validationResults) {
    const allValid = Object.values(validationResults).every(result => result.isValid);
    if (!allValid) return false;
  }

  return true;
}