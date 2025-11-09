import { Request, Response } from 'express';
import prisma from '../utils/database';
import { LinkedInService } from '../services/linkedinService';

export class SchedulerController {
  /**
   * Endpoint to process scheduled posts
   * This should be called by a cronjob (e.g., Vercel Cron Jobs)
   * Recommended schedule: Every 5 minutes
   */
  static async processScheduledPosts(req: Request, res: Response) {
    try {
      // Optional: Add a simple API key check for security
      const apiKey = req.headers['x-scheduler-key'] || req.query.key;
      const expectedKey = process.env.SCHEDULER_API_KEY;
      
      if (expectedKey && apiKey !== expectedKey) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const now = new Date();
      const processedPosts: string[] = [];
      const errors: string[] = [];

      // Find all posts that are scheduled and due (or overdue by less than 10 minutes)
      const duePosts = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: new Date(now.getTime() + 10 * 60 * 1000) // Due or overdue by less than 10 minutes
          }
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          user: {
            include: {
              linkedinAccounts: {
                where: {
                  expiresAt: {
                    gt: now // Only active accounts
                  }
                },
                take: 1
              }
            }
          }
        }
      });

      console.log(`📅 Found ${duePosts.length} scheduled post(s) to process`);

      for (const post of duePosts) {
        // Only process if scheduled time has passed
        if (post.scheduledAt <= now) {
          try {
            await this.publishPost(post);
            processedPosts.push(post.id);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`${post.id}: ${errorMsg}`);
            console.error(`❌ Failed to publish post ${post.id}:`, error);
          }
        }
      }

      res.json({
        success: true,
        message: 'Scheduled posts processed',
        stats: {
          checked: duePosts.length,
          processed: processedPosts.length,
          errors: errors.length
        },
        processedPosts,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error processing scheduled posts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process scheduled posts'
      });
    }
  }

  private static async publishPost(post: any) {
    const linkedInAccount = post.user?.linkedinAccounts?.[0];

    if (!linkedInAccount) {
      throw new Error('LinkedIn account not connected or expired');
    }

    // Check if token is still valid
    if (linkedInAccount.expiresAt < new Date()) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'ERROR',
          errorMessage: 'LinkedIn token expired. Please reconnect your account.'
        }
      });
      throw new Error('LinkedIn token expired');
    }

    console.log(`📤 Publishing post ${post.id} to LinkedIn...`);

    // Post to LinkedIn
    const linkedinPostId = await LinkedInService.postContent({
      postId: post.id,
      userId: post.userId,
      content: post.content,
      images: post.images.map((img: any) => img.imageUrl)
    }, linkedInAccount.accessToken);

    // Fetch analytics after posting
    let analytics = { impressions: 0, likes: 0, comments: 0, reposts: 0 };
    if (linkedinPostId) {
      try {
        analytics = await LinkedInService.getPostAnalytics(linkedinPostId, linkedInAccount.accessToken);
      } catch (error) {
        console.error('Failed to fetch initial analytics:', error);
      }
    }

    // Update post status with LinkedIn post ID
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        linkedinPostId: linkedinPostId
      }
    });

    console.log(`✅ Post ${post.id} successfully published to LinkedIn`);
  }

  /**
   * Health check endpoint for scheduler
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const scheduledCount = await prisma.post.count({
        where: {
          status: 'SCHEDULED'
        }
      });

      const dueCount = await prisma.post.count({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: new Date()
          }
        }
      });

      res.json({
        success: true,
        stats: {
          totalScheduled: scheduledCount,
          dueNow: dueCount
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get scheduler stats'
      });
    }
  }
}
