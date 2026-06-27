import { body, param, query, validationResult } from 'express-validator';

export const runValidation = (checks) => async (req, res, next) => {
  await Promise.all(checks.map(check => check.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const optionalContact = [
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phonenumber').optional().trim().notEmpty().withMessage('Phone required')
];

export const signupChecks = [
  body('fullname').trim().notEmpty().withMessage('Full name required'),
  body('username').trim().notEmpty().withMessage('Username required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phonenumber').trim().notEmpty().withMessage('Phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['job seeker', 'recruiter']).withMessage('Invalid role')
];

export const loginChecks = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const forgotPasswordChecks = [
  ...optionalContact,
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phonenumber) {
      throw new Error('Provide email or phone number');
    }
    return true;
  })
];

export const verifyOtpChecks = [
  ...optionalContact,
  body('otp').trim().notEmpty().withMessage('OTP required'),
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phonenumber) {
      throw new Error('Provide email or phone number');
    }
    return true;
  })
];

export const resetPasswordChecks = [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const postJobChecks = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobtype').trim().notEmpty().withMessage('Job type is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required')
];

export const updateProfileChecks = [
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phonenumber').optional().trim().notEmpty().withMessage('Phone number invalid'),
  body('education').optional().trim().isString(),
  body('experience').optional().trim().isString(),
  body('skills').optional().trim().isString(),
  body('resumeText').optional().trim().isString(),
  body('links').optional().trim().isString(),
  body('companyName').optional().trim().isString(),
  body('companyWebsite').optional().trim().isString(),
  body('companyDescription').optional().trim().isString(),
  body('location').optional().trim().isString(),
  body('position').optional().trim().isString()
];
