import { body, param, query, validationResult } from 'express-validator';

export const runValidation = (checks) => async (req, res, next) => {
  await Promise.all(checks.map(check => check.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

export const signupChecks = [
  body('fullname').trim().notEmpty().withMessage('fullname required'),
  body('username').trim().notEmpty().withMessage('username required'),
  body('email').isEmail().withMessage('valid email required').normalizeEmail(),
  body('phonenumber').trim().notEmpty().withMessage('phone required'),
  body('password').isLength({ min: 6 }).withMessage('password min 6 chars'),
  body('role').isIn(['job seeker', 'recruiter']).withMessage('invalid role')
];

export const loginChecks = [
  body('email').isEmail().withMessage('valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('password min 6 chars')
];
