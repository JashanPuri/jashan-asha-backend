import { Response } from 'express';

/**
 * Standard success response
 */
export const successResponse = (
  res: Response,
  data: any = {},
  message = 'Operation successful',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response
 */
export const errorResponse = (
  res: Response,
  message = 'Operation failed',
  statusCode = 500,
  error: any = {}
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};

/**
 * Created response (201)
 */
export const createdResponse = (
  res: Response,
  data: any = {},
  message = 'Resource created successfully'
) => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 */
export const noContentResponse = (res: Response) => {
  return res.status(204).end();
}; 