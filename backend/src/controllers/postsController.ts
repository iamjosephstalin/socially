import { Response } from 'express';
import { AuthenticatedRequest, CreatePostRequest, UpdatePostRequest, ApiResponse, PostWithImages } from '../types';
import prisma from '../utils/database';
import { LinkedInService } from '../services/linkedinService';
import { schedulePost } from '../services/schedulerService';

export class PostsController {
  static async getPosts(req: AuthenticatedRequest, res: Response) {
    try {
      const posts = await prisma.post.findMany({
        where: { userId: req.user!.id },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          user: {
            include: {
              linkedinAccounts: {
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Fetch analytics for posted posts that have LinkedIn post ID
      const postsWithAnalytics = await Promise.all(
        posts.map(async (post) => {
          if (post.status === 'POSTED' && post.linkedinPostId && post.user?.linkedinAccounts?.[0]) {
            try {
              const linkedInAccount = post.user.linkedinAccounts[0];
              // Only fetch if token is still valid
              if (linkedInAccount.expiresAt > new Date()) {
                console.log(`Fetching analytics for post ${post.id} with LinkedIn ID: ${post.linkedinPostId}`);
                const analytics = await LinkedInService.getPostAnalytics(
                  post.linkedinPostId,
                  linkedInAccount.accessToken
                );
                console.log(`Analytics for post ${post.id}:`, analytics);
                return { ...post, analytics };
              } else {
                console.warn(`LinkedIn token expired for post ${post.id}, skipping analytics fetch`);
              }
            } catch (error) {
              console.error(`Failed to fetch analytics for post ${post.id}:`, error);
            }
          } else {
            if (post.status === 'POSTED') {
              console.warn(`Post ${post.id} is POSTED but missing linkedinPostId:`, post.linkedinPostId);
            }
          }
          // Return post with default analytics if not posted or fetch failed
          // Note: Prisma Post type doesn't have analytics, we add it here
          return {
            ...post,
            analytics: { impressions: 0, likes: 0, comments: 0, reposts: 0 }
          };
        })
      );

      res.json({
        success: true,
        data: postsWithAnalytics,
        message: 'Posts retrieved successfully'
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve posts'
      });
    }
  }

  static async createPost(req: any, res: Response) {
    try {
      const { content, scheduledAt, images = [] } = req.body;

      const scheduledDate = new Date(scheduledAt);
      const isScheduled = scheduledDate > new Date();
      
      // Create post
      const post = await prisma.post.create({
        data: {
          userId: req.user!.id,
          content,
          scheduledAt: scheduledDate,
          status: isScheduled ? 'SCHEDULED' : 'DRAFT'
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Create post images if provided
      if (images.length > 0) {
        await prisma.postImage.createMany({
          data: images.map((imageUrl: string, index: number) => ({
            postId: post.id,
            imageUrl,
            order: index
          }))
        });
      }

      // If scheduled for future, add to scheduler
      if (isScheduled) {
        try {
          await schedulePost({
            postId: post.id,
            userId: req.user!.id,
            content: post.content,
            images: images
          }, scheduledDate);
          console.log(`Post ${post.id} scheduled for ${scheduledDate}`);
        } catch (schedulerError) {
          console.error('Failed to schedule post (will be picked up by polling):', schedulerError);
          // Don't fail the request if scheduling fails - polling will pick it up
        }
      }

      // Refetch post with images
      const postWithImages = await prisma.post.findUnique({
        where: { id: post.id },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: postWithImages!,
        message: isScheduled ? 'Post scheduled successfully' : 'Post created successfully'
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create post'
      });
    }
  }

  static async updatePost(req: any, res: Response) {
    try {
      const { postId } = req.params;
      const { content, scheduledAt, status, images } = req.body;
      
      console.log('Update post request:', { postId, content, scheduledAt, status, images, userId: req.user?.id });

      // Check if post belongs to user
      const existingPost = await prisma.post.findFirst({
        where: { 
          id: postId,
          userId: req.user!.id 
        }
      });

      if (!existingPost) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }

      // Update post
      const updateData: any = {};
      if (content !== undefined) updateData.content = content;
      if (scheduledAt !== undefined && scheduledAt !== null) {
        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid scheduledAt date format'
          });
        }
        updateData.scheduledAt = scheduledDate;
      }
      if (status !== undefined && status !== null) {
        // Validate status enum value
        const validStatuses = ['DRAFT', 'SCHEDULED', 'POSTED', 'ERROR'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          });
        }
        updateData.status = status;
      }

      const post = await prisma.post.update({
        where: { id: postId },
        data: updateData,
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Update images if provided
      if (images !== undefined) {
        // Delete existing images
        await prisma.postImage.deleteMany({
          where: { postId }
        });

        // Create new images
        if (images.length > 0) {
          await prisma.postImage.createMany({
            data: images.map((imageUrl: string, index: number) => ({
              postId,
              imageUrl,
              order: index
            }))
          });
        }
      }

      // If status is SCHEDULED and scheduledAt is in future, ensure it's scheduled
      if (post.status === 'SCHEDULED' && post.scheduledAt > new Date()) {
        try {
          const postImages = images !== undefined ? images : post.images.map(img => img.imageUrl);
          await schedulePost({
            postId: post.id,
            userId: req.user!.id,
            content: post.content,
            images: postImages
          }, post.scheduledAt);
          console.log(`Post ${post.id} re-scheduled for ${post.scheduledAt}`);
        } catch (schedulerError) {
          console.error('Failed to schedule post (will be picked up by polling):', schedulerError);
          // Don't fail the request if scheduling fails
        }
      }

      // Refetch post with images
      const postWithImages = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      res.json({
        success: true,
        data: postWithImages!,
        message: 'Post updated successfully'
      });
    } catch (error) {
      console.error('Update post error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to update post',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

  static async deletePost(req: any, res: Response) {
    try {
      const { postId } = req.params;

      // Check if post belongs to user
      const existingPost = await prisma.post.findFirst({
        where: { 
          id: postId,
          userId: req.user!.id 
        }
      });

      if (!existingPost) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }

      // Delete post (images will be deleted automatically due to cascade)
      await prisma.post.delete({
        where: { id: postId }
      });

      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete post'
      });
    }
  }

  static async postNow(req: any, res: Response) {
    try {
      const { postId } = req.params;

      // Check if post belongs to user
      const post = await prisma.post.findFirst({
        where: { 
          id: postId,
          userId: req.user!.id 
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }

      // Get user's LinkedIn account
      const linkedInAccount = await prisma.linkedInAccount.findFirst({
        where: { userId: req.user!.id }
      });

      if (!linkedInAccount) {
        return res.status(400).json({
          success: false,
          error: 'LinkedIn account not connected. Please connect your LinkedIn account in profile settings.'
        });
      }

      // Check if token is expired
      if (linkedInAccount.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'LinkedIn connection expired. Please reconnect your LinkedIn account.'
        });
      }

      // Post to LinkedIn
      const linkedinPostId = await LinkedInService.postContent({
        postId: post.id,
        userId: req.user!.id,
        content: post.content,
        images: post.images.map(img => img.imageUrl)
      }, linkedInAccount.accessToken);

      // Fetch analytics after posting (may return zeros if API not available)
      let analytics = { impressions: 0, likes: 0, comments: 0, reposts: 0 };
      if (linkedinPostId) {
        try {
          analytics = await LinkedInService.getPostAnalytics(linkedinPostId, linkedInAccount.accessToken);
        } catch (error) {
          console.error('Failed to fetch initial analytics:', error);
        }
      }

      // Update post status to POSTED with LinkedIn post ID
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'POSTED',
          postedAt: new Date(),
          scheduledAt: new Date(),
          linkedinPostId: linkedinPostId
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Add analytics to response
      const postWithAnalytics = {
        ...updatedPost,
        analytics
      };

      res.json({
        success: true,
        data: postWithAnalytics,
        message: 'Post published to LinkedIn successfully'
      });
    } catch (error) {
      console.error('Post now error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to post to LinkedIn';
      
      // Update post with error status
      try {
        await prisma.post.update({
          where: { id: req.params.postId },
          data: {
            status: 'ERROR',
            errorMessage: errorMessage
          }
        });
      } catch (dbError) {
        console.error('Failed to update post error status:', dbError);
      }

      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  static async refreshAnalytics(req: any, res: Response) {
    try {
      const { postId } = req.params;

      // Check if post belongs to user
      const post = await prisma.post.findFirst({
        where: { 
          id: postId,
          userId: req.user!.id 
        },
        include: {
          user: {
            include: {
              linkedinAccounts: {
                take: 1
              }
            }
          }
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }

      if (post.status !== 'POSTED') {
        return res.status(400).json({
          success: false,
          error: 'Post is not published. Only posted posts can have analytics refreshed.'
        });
      }

      if (!post.linkedinPostId) {
        return res.status(400).json({
          success: false,
          error: 'Post does not have a LinkedIn post ID. This post may have been published before analytics tracking was enabled. Please republish the post to get analytics tracking.',
          details: 'The post was published but the LinkedIn post ID was not saved. To fix this, you can republish the post or wait for automatic sync if available.'
        });
      }

      const linkedInAccount = post.user?.linkedinAccounts?.[0];
      if (!linkedInAccount) {
        return res.status(400).json({
          success: false,
          error: 'LinkedIn account not found'
        });
      }

      if (linkedInAccount.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'LinkedIn token expired. Please reconnect your account.'
        });
      }

      // Fetch analytics
      const analytics = await LinkedInService.getPostAnalytics(
        post.linkedinPostId,
        linkedInAccount.accessToken
      );

      // Get updated post with analytics
      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      res.json({
        success: true,
        data: {
          analytics: {
            impressions: Number(analytics.impressions || 0),
            likes: Number(analytics.likes || 0),
            comments: Number(analytics.comments || 0),
            reposts: Number(analytics.reposts || 0)
          },
          post: updatedPost
        },
        message: 'Analytics refreshed successfully'
      });
    } catch (error) {
      console.error('Refresh analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh analytics'
      });
    }
  }
}
