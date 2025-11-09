import { Post, User, Automation, PostStatus } from '../types';

// Mock data for demo purposes
const mockPosts: Post[] = [
  {
    id: '1',
    content: '🚀 Excited to share our new product launch! Check out the amazing features we\'ve built for our users.',
    status: PostStatus.POSTED,
    scheduledAt: new Date('2024-01-15T10:00:00Z'),
    postedAt: new Date('2024-01-15T10:00:00Z'),
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    analytics: {
      impressions: 15420,
      likes: 234,
      comments: 45,
      reposts: 12
    }
  },
  {
    id: '2',
    content: '💡 Just had an amazing brainstorming session with the team. Innovation happens when great minds collaborate!',
    status: PostStatus.POSTED,
    scheduledAt: new Date('2024-01-14T14:30:00Z'),
    postedAt: new Date('2024-01-14T14:30:00Z'),
    analytics: {
      impressions: 8750,
      likes: 167,
      comments: 23,
      reposts: 8
    }
  },
  {
    id: '3',
    content: '📈 Q1 results are in and we\'re thrilled with our progress. Thank you to everyone who made this possible!',
    status: PostStatus.SCHEDULED,
    scheduledAt: new Date('2024-01-20T09:00:00Z'),
    analytics: {
      impressions: 0,
      likes: 0,
      comments: 0,
      reposts: 0
    }
  },
  {
    id: '4',
    content: '🎯 Setting new goals for the quarter. Focus, dedication, and teamwork will get us there!',
    status: PostStatus.SCHEDULED,
    scheduledAt: new Date('2024-01-22T11:00:00Z'),
    analytics: {
      impressions: 0,
      likes: 0,
      comments: 0,
      reposts: 0
    }
  },
  {
    id: '5',
    content: '🌟 Customer success story: How our platform helped increase productivity by 40%. Read more in our blog!',
    status: PostStatus.POSTED,
    scheduledAt: new Date('2024-01-12T16:00:00Z'),
    postedAt: new Date('2024-01-12T16:00:00Z'),
    analytics: {
      impressions: 22100,
      likes: 445,
      comments: 67,
      reposts: 28
    }
  }
];

const mockAutomations: Automation[] = [
  {
    id: '1',
    topic: 'Product Updates',
    frequency: 'Weekly',
    time: '09:00',
    status: 'active'
  },
  {
    id: '2',
    topic: 'Industry Insights',
    frequency: 'Bi-weekly',
    time: '14:00',
    status: 'active'
  },
  {
    id: '3',
    topic: 'Company Culture',
    frequency: 'Monthly',
    time: '11:00',
    status: 'paused'
  }
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class ApiService {
  private token: string | null = null;
  private useMockData: boolean = false; // Use real backend API

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If using mock data, simulate API delay and return mock data
    if (this.useMockData) {
      await this.delay();
      throw new Error('Using mock data - real API not available');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    return data.data || data;
  }

  // Authentication methods
  async signup(userData: { name: string; email: string; password: string }) {
    const response = await this.request<{ user: User; token: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: User; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async getLinkedInAuthUrl() {
    const response = await this.request<{ authUrl: string }>('/linkedin');
    return response.authUrl;
  }

  async connectLinkedIn(accessToken: string, profileId: string) {
    return this.request('/user/me/linkedin', {
      method: 'POST',
      body: JSON.stringify({ accessToken, profileId }),
    });
  }

  // Posts methods
  async getPosts(): Promise<Post[]> {
    if (this.useMockData) {
      await this.delay();
      return [...mockPosts];
    }
    
    try {
      const posts = await this.request<Post[]>('/posts');
      return posts.map(post => ({
        ...post,
        scheduledAt: new Date(post.scheduledAt),
        postedAt: post.postedAt ? new Date(post.postedAt) : undefined,
        // Ensure analytics numbers are actually numbers, not strings
        analytics: {
          impressions: Number(post.analytics?.impressions || 0),
          likes: Number(post.analytics?.likes || 0),
          comments: Number(post.analytics?.comments || 0),
          reposts: Number(post.analytics?.reposts || 0)
        }
      }));
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      await this.delay();
      return [...mockPosts];
    }
  }

  async createPost(postData: {
    content: string;
    scheduledAt: Date;
    images?: string[];
  }): Promise<Post> {
    const post = await this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        ...postData,
        scheduledAt: postData.scheduledAt.toISOString(),
      }),
    });

    return {
      ...post,
      scheduledAt: new Date(post.scheduledAt),
      postedAt: post.postedAt ? new Date(post.postedAt) : undefined,
      analytics: post.analytics || { impressions: 0, likes: 0, comments: 0, reposts: 0 }
    };
  }

  async updatePost(postId: string, postData: {
    content?: string;
    scheduledAt?: Date;
    status?: PostStatus;
    images?: string[];
  }): Promise<Post> {
    const post = await this.request<Post>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...postData,
        scheduledAt: postData.scheduledAt?.toISOString(),
      }),
    });

    return {
      ...post,
      scheduledAt: new Date(post.scheduledAt),
      postedAt: post.postedAt ? new Date(post.postedAt) : undefined,
      analytics: post.analytics || { impressions: 0, likes: 0, comments: 0, reposts: 0 }
    };
  }

  async deletePost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async publishPost(postId: string): Promise<Post> {
    return this.request<Post>(`/posts/${postId}/publish`, {
      method: 'POST',
    });
  }

  async refreshPostAnalytics(postId: string): Promise<{ impressions: number; likes: number; comments: number; reposts: number }> {
    const response = await this.request<{ analytics: { impressions: number; likes: number; comments: number; reposts: number } }>(`/posts/${postId}/refresh-analytics`, {
      method: 'POST',
    });
    return response.analytics;
  }

  // User methods
  async getUserProfile(): Promise<User & { linkedinAccounts?: any[] }> {
    return this.request<User & { linkedinAccounts?: any[] }>('/user/me');
  }

  async updateUserProfile(userData: { name?: string; avatarUrl?: string }): Promise<User> {
    return this.request<User>('/user/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAccount(): Promise<void> {
    await this.request('/user/me', {
      method: 'DELETE',
    });
    this.logout();
  }

  async exportUserData(): Promise<any> {
    return this.request('/user/me/export', {
      method: 'POST',
    });
  }

  // Automation methods
  async getAutomations(): Promise<Automation[]> {
    if (this.useMockData) {
      await this.delay();
      return [...mockAutomations];
    }
    
    try {
      return this.request<Automation[]>('/automations');
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      await this.delay();
      return [...mockAutomations];
    }
  }

  async createAutomation(automationData: {
    name: string;
    topics: string[];
    frequency: string;
    time: string;
  }): Promise<Automation> {
    return this.request<Automation>('/automations', {
      method: 'POST',
      body: JSON.stringify(automationData),
    });
  }

  async updateAutomation(automationId: string, automationData: {
    name?: string;
    topics?: string[];
    frequency?: string;
    time?: string;
    status?: 'active' | 'paused';
  }): Promise<Automation> {
    return this.request<Automation>(`/automations/${automationId}`, {
      method: 'PUT',
      body: JSON.stringify(automationData),
    });
  }

  async deleteAutomation(automationId: string): Promise<void> {
    await this.request(`/automations/${automationId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
