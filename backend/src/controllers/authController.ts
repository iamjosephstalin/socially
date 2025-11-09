import { Request, Response } from 'express';
import { SignupRequest, LoginRequest, AuthResponse, ApiResponse, AuthenticatedRequest } from '../types';
import { AuthUtils } from '../utils/auth';
import prisma from '../utils/database';

export class AuthController {
  static async signup(req: Request<{}, ApiResponse<AuthResponse>, SignupRequest>, res: Response) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Generate token
      const token = AuthUtils.generateToken(user as any);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        },
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  }

  static async login(req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      console.log('Login attempt for email:', email);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await AuthUtils.comparePassword(password, user.hashedPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = AuthUtils.generateToken(user);

      const { hashedPassword, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login'
      });
    }
  }

  static async getLinkedInAuth(req: AuthenticatedRequest, res: Response) {
    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: 'LinkedIn Client ID not configured. Please set LINKEDIN_CLIENT_ID in environment variables.'
        });
      }

      // Include user ID in state for security
      const state = Buffer.from(JSON.stringify({ userId: req.user!.id, timestamp: Date.now() })).toString('base64');

      // Request permissions for posting and analytics
      // w_member_social: Post content on behalf of members
      // r_member_social: Read member's social posts (for analytics)
      // r_analytics_basic: Basic analytics access for impressions, views, etc.
      const scopes = [
        'openid',
        'profile', 
        'email',
        'w_member_social',  // Post content
        'r_member_social',  // Read posts (for matching/existing posts)
        'r_analytics_basic' // Analytics access (requires approval)
      ].join('%20');
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&state=${state}&scope=${scopes}`;

      res.json({
        success: true,
        data: { authUrl },
        message: 'LinkedIn auth URL generated'
      });
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate LinkedIn auth URL'
      });
    }
  }

  static async handleLinkedInCallback(req: Request, res: Response) {
    try {
      console.log('LinkedIn callback received:', req.url, req.query);
      const { code, state, error, error_description } = req.query;

      // Handle OAuth errors from LinkedIn
      if (error) {
        console.error('LinkedIn OAuth error:', error, error_description);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const errorMsg = (error_description as string) || (error as string) || 'oauth_error';
        return res.redirect(`${frontendUrl}?linkedin_error=${encodeURIComponent(errorMsg)}&view=profile`);
      }

      if (!code) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}?linkedin_error=no_code&view=profile`);
      }

      // Decode state to get user ID
      let userId: string;
      try {
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        userId = stateData.userId;
      } catch {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}?linkedin_error=invalid_state&view=profile`);
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        }),
      });

      const tokenData = await tokenResponse.json() as any;

      if (!tokenResponse.ok) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}?linkedin_error=token_exchange_failed&view=profile`);
      }

      // Get user profile from LinkedIn using OpenID Connect
      let profileData: any;
      try {
        // Try OpenID Connect endpoint first
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          // Map OpenID profile to expected format
          profileData.id = profileData.sub || profileData.id;
        } else {
          // Fallback to legacy endpoint
          const legacyResponse = await fetch('https://api.linkedin.com/v2/me', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'X-Restli-Protocol-Version': '2.0.0'
            },
          });
          profileData = await legacyResponse.json();
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        // Use a placeholder ID if we can't fetch profile
        profileData = { id: 'unknown' };
      }

      // Save or update LinkedIn account for the user
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
      
      const existingAccount = await prisma.linkedInAccount.findFirst({
        where: { userId }
      });

      if (existingAccount) {
        await prisma.linkedInAccount.update({
          where: { id: existingAccount.id },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt,
            linkedinProfileId: profileData.id
          }
        });
      } else {
        await prisma.linkedInAccount.create({
          data: {
            userId,
            linkedinProfileId: profileData.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt
          }
        });
      }

      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}?linkedin_connected=true&view=profile`);
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}?linkedin_error=callback_error&view=profile`);
    }
  }
}
