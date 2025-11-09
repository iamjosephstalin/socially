import { PostJob } from '../types';

/**
 * Simple scheduler service - no Redis/BullMQ needed
 * Posts are scheduled via database status (SCHEDULED)
 * A cronjob endpoint (/api/scheduler/process) processes them periodically
 */

// Helper function for marking posts as scheduled
// The actual scheduling is handled by the database status
export async function schedulePost(postData: PostJob, scheduledAt?: Date) {
  // Posts are stored in database with SCHEDULED status
  // The cronjob endpoint (/api/scheduler/process) will pick them up and publish them
  console.log(`📝 Post ${postData.postId} marked as SCHEDULED in database for ${scheduledAt}`);
}