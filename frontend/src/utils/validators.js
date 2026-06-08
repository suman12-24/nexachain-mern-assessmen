/**
 * Frontend validators — mirrors backend utils/validators.js exactly.
 * Keep both files in sync when changing rules.
 */

export const INDIAN_MOBILE_REGEX = /^(?:\+91|91|0)?([6-9]\d{9})$/;

const PASSWORD_RULES = {
  minLength:    8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasDigit:     /[0-9]/,
  hasSpecial:   /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/,
};

export function validateIndianMobile(mobile) {
  if (!mobile) return 'Mobile number is required';
  const cleaned = mobile.trim().replace(/\s+/g, '');
  if (!INDIAN_MOBILE_REGEX.test(cleaned))
    return 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8 or 9)';
  return null; // null = valid
}

export function getPasswordStrengthRules(password = '') {
  return [
    { rule: 'minLength', label: 'At least 8 characters',         passed: password.length >= PASSWORD_RULES.minLength },
    { rule: 'uppercase', label: 'One uppercase letter (A–Z)',     passed: PASSWORD_RULES.hasUppercase.test(password) },
    { rule: 'lowercase', label: 'One lowercase letter (a–z)',     passed: PASSWORD_RULES.hasLowercase.test(password) },
    { rule: 'digit',     label: 'One number (0–9)',               passed: PASSWORD_RULES.hasDigit.test(password) },
    { rule: 'special',   label: 'One special character (!@#$…)',  passed: PASSWORD_RULES.hasSpecial.test(password) },
  ];
}

export function getPasswordScore(password = '') {
  if (!password) return 0;
  const passed = getPasswordStrengthRules(password).filter(r => r.passed).length;
  if (passed <= 1) return 1;
  if (passed === 2) return 2;
  if (passed === 3) return 3;
  return 4;
}

export function validatePassword(password = '') {
  const rules = getPasswordStrengthRules(password);
  const failed = rules.filter(r => !r.passed);
  if (failed.length === 0) return null; // valid
  return `Password needs: ${failed.map(r => r.label.toLowerCase()).join(', ')}`;
}
