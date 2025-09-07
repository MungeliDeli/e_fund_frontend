import Joi from 'joi';

const strongPasswordRegex = new RegExp(
  "^(?=.*[a-z])" + // At least one lowercase letter
  "(?=.*[A-Z])" + // At least one uppercase letter
  "(?=.*\\d)" +   // At least one digit
  // Define allowed special characters. Remember to escape special regex characters like -, [, ], etc.
  "(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\|,.<>/?`~])" + // At least one special character
  // Allowed characters for the entire string, and length constraint
  "[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\|,.<>/?`~]{8,128}$"
);

export const signUpSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .pattern(strongPasswordRegex)
    .required()
    .messages({
      'string.pattern.base': 'Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*).',
      'any.required': 'Password is required.',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  firstName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must not exceed 100 characters',
      'string.pattern.base': "First name can only contain letters, spaces, hyphens, and apostrophes",
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must not exceed 100 characters',
      'string.pattern.base': "Last name can only contain letters, spaces, hyphens, and apostrophes",
      'any.required': 'Last name is required',
    }),
  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (10-15 digits, numbers only)',
    }),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other', 'Prefer not to say')
    .optional()
    .messages({
      'any.only': 'Gender must be one of: Male, Female, Other, Prefer not to say',
    }),
  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
    }),
  country: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Country must be at least 2 characters long',
      'string.max': 'Country must not exceed 100 characters',
    }),
  city: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City must not exceed 100 characters',
    }),
  address: Joi.string()
    .min(5)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address must not exceed 255 characters',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

export const passwordSchema = Joi.object({
  password: Joi.string()
    .pattern(strongPasswordRegex)
    .required()
    .messages({
      'string.pattern.base': 'Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*).',
      'any.required': 'Password is required.',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  token: Joi.string().required().messages({
    'any.required': 'token is required',
  }),
});


