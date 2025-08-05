import Joi from "joi";

export const campaignSubmissionSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required().messages({
    "string.empty": "Campaign title is required.",
    "string.min": "Campaign title must be at least 3 characters long.",
    "string.max": "Campaign title cannot be more than 255 characters long.",
    "any.required": "Campaign title is required.",
  }),
  description: Joi.string().trim().min(10).max(2000).required().messages({
    "string.empty": "Campaign description is required.",
    "string.min": "Campaign description must be at least 10 characters long.",
    "string.max":
      "Campaign description cannot be more than 2000 characters long.",
    "any.required": "Campaign description is required.",
  }),
  goalAmount: Joi.number().positive().required().messages({
    "number.base": "Goal amount must be a valid number.",
    "number.positive": "Goal amount must be greater than 0.",
    "any.required": "Goal amount is required.",
  }),
  startDate: Joi.date().iso().required().messages({
    "date.base": "Start date must be a valid date.",
    "date.format": "Enter a valid start date (YYYY-MM-DD).",
    "any.required": "Start date is required.",
  }),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "date.base": "End date must be a valid date.",
    "date.format": "Enter a valid end date (YYYY-MM-DD).",
    "date.greater": "End date must be after start date.",
    "any.required": "End date is required.",
  }),
  categoryIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      "array.base": "Categories must be an array.",
      "array.min": "At least one category is required.",
      "any.required": "Categories are required.",
    }),
  customPageSettings: Joi.object().optional(),
  templateId: Joi.string().optional(),
});

export const validateCampaignSubmission = (data) => {
  return campaignSubmissionSchema.validate(data, { abortEarly: false });
};

// Helper function to check if campaign is new (no ID)
export const isNewCampaign = (campaignId) => {
  return !campaignId || campaignId === null || campaignId === undefined;
};
