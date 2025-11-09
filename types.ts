export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  POSTED = 'POSTED',
  ERROR = 'ERROR',
}

export interface PostAnalytics {
  impressions: number;
  likes: number;
  comments: number;
  reposts: number;
}

export interface Post {
  id: string;
  content: string;
  status: PostStatus;
  scheduledAt: Date;
  postedAt?: Date;
  image?: string;
  analytics: PostAnalytics;
  errorMessage?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  avatarUrl: string;
  linkedinProfile?: string;
}

export interface Automation {
    id: string;
    topic: string;
    frequency: string;
    time: string;
    status: 'active' | 'paused';
}