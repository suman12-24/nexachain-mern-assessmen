/**
 * validators.js
 * Centralised validation rules for Indian phone numbers and strong passwords.
 */

const INDIAN_MOBILE_REGEX = /^(?:\+91|91|0)?([6-9]\d{9})$/;

const PASSWORD_RULES = {
  minLength:    8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasDigit:     /[0-9]/,
  hasSpecial:   /[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]/,
};

function validateIndianMobile(mobile) {
  if (!mobile || typeof mobile !== 'string')
    return { valid: false, message: 'Mobile number is required' };
  const cleaned = mobile.trim().replace(/\s+/g, '');
  if (!INDIAN_MOBILE_REGEX.test(cleaned))
    return { valid: false, message: 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8 or 9)' };
  return { valid: true };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string')
    return { valid: false, message: 'Password is required', failures: ['required'] };

  const failures = [];
  if (password.length < PASSWORD_RULES.minLength)    failures.push('minLength');
  if (!PASSWORD_RULES.hasUppercase.test(password))   failures.push('uppercase');
  if (!PASSWORD_RULES.hasLowercase.test(password))   failures.push('lowercase');
  if (!PASSWORD_RULES.hasDigit.test(password))       failures.push('digit');
  if (!PASSWORD_RULES.hasSpecial.test(password))     failures.push('special');

  if (failures.length > 0) {
    const msgs = {
      minLength: 'at least 8 characters',
      uppercase: 'one uppercase letter (A-Z)',
      lowercase: 'one lowercase letter (a-z)',
      digit:     'one number (0-9)',
      special:   'one special character (!@#$%...)',
    };
    return { valid: false, message: `Password must contain: ${failures.map(f => msgs[f]).join(', ')}`, failures };
  }
  return { valid: true, failures: [] };
}

function getPasswordStrengthRules(password) {
  return [
    { rule: 'minLength', label: 'At least 8 characters',         passed: password.length >= PASSWORD_RULES.minLength },
    { rule: 'uppercase', label: 'One uppercase letter (A–Z)',     passed: PASSWORD_RULES.hasUppercase.test(password) },
    { rule: 'lowercase', label: 'One lowercase letter (a–z)',     passed: PASSWORD_RULES.hasLowercase.test(password) },
    { rule: 'digit',     label: 'One number (0–9)',               passed: PASSWORD_RULES.hasDigit.test(password) },
    { rule: 'special',   label: 'One special character (!@#$…)',  passed: PASSWORD_RULES.hasSpecial.test(password) },
  ];
}

function getPasswordScore(password) {
  if (!password) return 0;
  const passed = getPasswordStrengthRules(password).filter(r => r.passed).length;
  if (passed <= 1) return 1;
  if (passed === 2) return 2;
  if (passed === 3) return 3;
  return 4;
}

module.exports = { validateIndianMobile, validatePassword, getPasswordStrengthRules, getPasswordScore };
