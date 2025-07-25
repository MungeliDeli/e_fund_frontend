import Joi from 'joi';

export const profileInfoSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'First name is required.',
    'string.min': 'First name must be at least 2 characters long.',
    'string.max': 'First name cannot be more than 50 characters long.',
    'any.required': 'First name is required.',
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Last name is required.',
    'string.min': 'Last name must be at least 2 characters long.',
    'string.max': 'Last name cannot be more than 50 characters long.',
    'any.required': 'Last name is required.',
  }),
  country: Joi.string().trim().max(100).allow('').optional().messages({
    'string.max': 'Country cannot be more than 100 characters long.',
  }),
  city: Joi.string().trim().max(100).allow('').optional().messages({
    'string.max': 'City cannot be more than 100 characters long.',
  }),
  address: Joi.string().trim().max(255).allow('').optional().messages({
    'string.max': 'Address cannot be more than 255 characters long.',
  }),
});

export const organizationSchema = Joi.object({
  organization_name: Joi.string().trim().max(255).required().messages({
    'string.empty': 'Organization name is required.',
    'string.max': 'Organization name cannot be more than 255 characters.',
    'any.required': 'Organization name is required.',
  }),
  organization_short_name: Joi.string().trim().max(50).allow('').messages({
    'string.max': 'Short name cannot be more than 50 characters.',
  }),
  organization_type: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Organization type is required.',
    'string.max': 'Organization type cannot be more than 50 characters.',
    'any.required': 'Organization type is required.',
  }),
  official_email: Joi.string().trim().email({ tlds: false }).max(255).required().messages({
    'string.empty': 'Official email is required.',
    'string.email': 'Enter a valid email address.',
    'string.max': 'Email cannot be more than 255 characters.',
    'any.required': 'Official email is required.',
  }),
  official_website_url: Joi.string().trim().uri({ allowRelative: false }).max(255).allow('').messages({
    'string.uri': 'Enter a valid website URL.',
    'string.max': 'Website URL cannot be more than 255 characters.',
  }),
  address: Joi.string().trim().max(255).allow('').messages({
    'string.max': 'Address cannot be more than 255 characters.',
  }),
  mission_description: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Mission description cannot be more than 2000 characters.',
  }),
  establishment_date: Joi.date().iso().allow('').messages({
    'date.format': 'Enter a valid date (YYYY-MM-DD).',
  }),
  campus_affiliation_scope: Joi.string().trim().max(50).allow('').messages({
    'string.max': 'Campus affiliation scope cannot be more than 50 characters.',
  }),
  affiliated_schools_names: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Affiliated schools cannot be more than 2000 characters.',
  }),
  affiliated_department_names: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Affiliated departments cannot be more than 2000 characters.',
  }),
  primary_contact_person_name: Joi.string().trim().max(255).required().messages({
    'string.empty': 'Primary contact name is required.',
    'string.max': 'Primary contact name cannot be more than 255 characters.',
    'any.required': 'Primary contact name is required.',
  }),
  primary_contact_person_email: Joi.string().trim().email({ tlds: false }).max(255).required().messages({
    'string.empty': 'Primary contact email is required.',
    'string.email': 'Enter a valid email address.',
    'string.max': 'Contact email cannot be more than 255 characters.',
    'any.required': 'Primary contact email is required.',
  }),
  primary_contact_person_phone: Joi.string().trim().max(20).required().messages({
    'string.empty': 'Primary contact phone is required.',
    'string.max': 'Contact phone cannot be more than 20 characters.',
    'any.required': 'Primary contact phone is required.',
  }),
  // Images are handled separately in the form
});
