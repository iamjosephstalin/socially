import { Request } from 'express';
import { User, Post, Automation, LinkedInAccount } from '@prisma/client';

// Extended types with relations
export interface UserWithLinkedIn extends User {
  linkedinAccounts: LinkedInAccount[];
}

export interface PostWithImages extends Post {
  images: { id: string; imageUrl: string; order: number }[];
}

export interface AutomationWithUser extends Automation {
  user: User;
}

// Request types with user
export interface AuthenticatedRequest<T = any> extends Request {
  user?: User;
  body: T;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'hashedPassword'>;
  token: string;
}

// Post types
export interface CreatePostRequest {
  content: string;
  scheduledAt: string;
  images?: string[];
}

export interface UpdatePostRequest {
  content?: string;
  scheduledAt?: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'ERROR';
  images?: string[];
}

// Automation types
export interface CreateAutomationRequest {
  name: string;
  topics: string[];
  frequency: string;
  time: string;
}

export interface UpdateAutomationRequest {
  name?: string;
  topics?: string[];
  frequency?: string;
  time?: string;
  status?: 'ACTIVE' | 'PAUSED';
}

// LinkedIn OAuth types
export interface LinkedInOAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

// Job types for BullMQ
export interface PostJob {
  postId: string;
  userId: string;
  content: string;
  images?: string[];
}

export interface AutomationJob {
  automationId: string;
  userId: string;
  topics: string[];
}
