import { z } from 'zod';

export const truckFormSchema = z.object({
  plate_number: z
    .string()
    .min(3, 'License plate must be at least 3 characters')
    .max(20, 'License plate must not exceed 20 characters')
    .transform((val) => val.trim().toUpperCase()),
  carrier_name: z
    .string()
    .min(2, 'Carrier name is required (min 2 characters)')
    .max(100, 'Carrier name must not exceed 100 characters')
    .transform((val) => val.trim()),
  driver_name: z
    .string()
    .min(2, 'Driver name must be at least 2 characters')
    .max(100, 'Driver name must not exceed 100 characters')
    .transform((val) => val.trim()),
  driver_phone: z
    .string()
    .min(6, 'Valid phone number required')
    .max(25, 'Phone number too long')
    .regex(/^[\+\d\s\-\(\)\.]+$/, 'Invalid phone number format')
    .transform((val) => val.trim()),
  dock_number: z.string().min(1, 'Dock number is required').max(50),
  cargo_desc: z.string().min(2, 'Cargo description is required').max(255),
  status: z.enum(['INBOUND', 'DOCKED', 'UNLOADING', 'DEPARTED']),
  country: z.enum(['IN', 'US']),
  free_time_minutes: z.coerce.number().int().min(1, 'Free time must be at least 1 minute').max(1440, 'Max 24 hours (1440 minutes)')
});

export type TruckFormData = z.infer<typeof truckFormSchema>;

export const cameraFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Camera name must be at least 2 characters')
    .max(100, 'Camera name must not exceed 100 characters')
    .transform((val) => val.trim()),
  location: z.string().min(2, 'Location is required').max(100),
  stream_type: z.enum(['DMSS', 'RTSP', 'HLS', 'WEBRTC', 'SIMULATED', 'NVR_BATCH']),
  brand: z.string().min(1, 'Brand is required'),
  ai_pipeline: z.string().min(1, 'AI pipeline is required'),
  resolution: z.string().min(1, 'Resolution is required'),
  fps: z.coerce.number().int().min(1, 'FPS must be at least 1').max(120, 'FPS cannot exceed 120'),
  status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'DEGRADED']),
  dmss_serial: z.string().optional(),
  dmss_channel: z.coerce.number().int().min(0).max(128).optional(),
  dmss_username: z.string().optional(),
  dmss_password: z.string().optional(),
  stream_url: z.string().optional()
});

export type CameraFormData = z.infer<typeof cameraFormSchema>;

export const nvrBatchFormSchema = z.object({
  nvrName: z.string().min(2, 'NVR name is required').max(100),
  nvrSerial: z
    .string()
    .min(6, 'Valid NVR serial is required (min 6 characters)')
    .max(50)
    .regex(/^[A-Za-z0-9\-_]+$/, 'NVR serial must contain only alphanumeric characters'),
  nvrUsername: z.string().optional(),
  nvrPassword: z.string().min(4, 'NVR password is required (min 4 characters)'),
  nvrChannels: z.coerce.number().int().min(1, 'Must have at least 1 channel').max(64, 'Maximum 64 channels supported'),
  selectedChannels: z.array(z.number().int().min(1).max(64)).optional()
});

export type NvrBatchFormData = z.infer<typeof nvrBatchFormSchema>;

export const supportTicketSchema = z.object({
  user_email: z.string().email('Please enter a valid email address'),
  category: z.string().min(2, 'Category is required'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  description: z.string().min(10, 'Please provide detailed description (min 10 characters)').max(2000)
});

export type SupportTicketFormData = z.infer<typeof supportTicketSchema>;

export const integrationConfigSchema = z.object({
  endpoint_url: z.string().url('Must be a valid HTTP or HTTPS URL').or(z.literal('')),
  api_key: z.string().min(8, 'API Key or token must be at least 8 characters').or(z.literal('')),
  webhook_secret: z.string().min(6, 'Secret must be at least 6 characters').or(z.literal('')),
  retry_limit: z.coerce.number().int().min(0).max(10),
  timeout_seconds: z.coerce.number().int().min(1).max(120),
  is_active: z.boolean().default(true)
});

export type IntegrationConfigFormData = z.infer<typeof integrationConfigSchema>;

export const corporateLoginSchema = z.object({
  email: z.string().email('Please enter a valid corporate email address'),
  password: z.string().min(4, 'Password must be at least 4 characters')
});

export type CorporateLoginFormData = z.infer<typeof corporateLoginSchema>;
