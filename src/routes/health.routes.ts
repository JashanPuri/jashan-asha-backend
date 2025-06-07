import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route   GET /api/ping
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Service is healthy',
  });
});

export default router; 