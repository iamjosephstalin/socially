import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AuthUtils } from '../utils/auth';
import prisma from '../utils/database';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          linkedinAccounts: {
            select: {
              id: true,
              linkedinProfileId: true,
              expiresAt: true,
              createdAt: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve profile'
      });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const { name, avatarUrl } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      // Delete user (all related data will be deleted due to cascade)
      await prisma.user.delete({
        where: { id: req.user!.id }
      });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete account'
      });
    }
  }

  static async exportData(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          posts: {
            include: {
              images: true
            }
          },
          automations: true,
          linkedinAccounts: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Remove sensitive data
      const { hashedPassword, ...exportData } = user;

      res.json({
        success: true,
        data: exportData,
        message: 'Data exported successfully'
      });
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export data'
      });
    }
  }

  static async connectLinkedIn(req: any, res: Response) {
    try {
      const { accessToken, profileId } = req.body;

      // Check if LinkedIn account already exists
      const existingAccount = await prisma.linkedInAccount.findFirst({
        where: { 
          userId: req.user!.id,
          linkedinProfileId: profileId
        }
      });

      if (existingAccount) {
        // Update existing account
        const updatedAccount = await prisma.linkedInAccount.update({
          where: { id: existingAccount.id },
          data: {
            accessToken,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
          }
        });

        return res.json({
          success: true,
          data: updatedAccount,
          message: 'LinkedIn account updated successfully'
        });
      }

      // Create new LinkedIn account
      const linkedInAccount = await prisma.linkedInAccount.create({
        data: {
          userId: req.user!.id,
          linkedinProfileId: profileId,
          accessToken,
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
        }
      });

      res.status(201).json({
        success: true,
        data: linkedInAccount,
        message: 'LinkedIn account connected successfully'
      });
    } catch (error) {
      console.error('Connect LinkedIn error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to connect LinkedIn account'
      });
    }
  }
}
