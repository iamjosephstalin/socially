
import { Post, PostAnalytics } from '../types';

// --- SIMULATED LINKEDIN API SERVICE ---

const SIMULATED_LATENCY_MS = 1500;
const SIMULATED_ERROR_RATE = 0.2; // 20% chance of API error

const possibleErrors = [
    "Invalid API token. Please reconnect your account.",
    "LinkedIn API is temporarily unavailable. Please try again later.",
    "You have exceeded your daily posting limit.",
    "The post content was flagged as duplicate. Please create unique content.",
];

/**
 * Simulates posting content to the LinkedIn API.
 * This will be replaced with a real API call.
 */
export const postToLinkedIn = (post: Post): Promise<void> => {
    console.log(`[API SIM] Attempting to post: "${post.content.substring(0, 30)}..."`);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < SIMULATED_ERROR_RATE) {
                const randomError = possibleErrors[Math.floor(Math.random() * possibleErrors.length)];
                console.error(`[API SIM] Failed to post: ${randomError}`);
                reject(new Error(randomError));
            } else {
                console.log(`[API SIM] Successfully posted: "${post.id}"`);
                resolve();
            }
        }, SIMULATED_LATENCY_MS);
    });
};


/**
 * Simulates fetching updated analytics for a post from the LinkedIn API.
 * This will be replaced with a real API call.
 */
export const fetchLinkedInAnalytics = (post: Post): Promise<PostAnalytics> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate analytics increasing over time
            const newAnalytics: PostAnalytics = {
                impressions: post.analytics.impressions + Math.floor(Math.random() * 500),
                likes: post.analytics.likes + Math.floor(Math.random() * 20),
                comments: post.analytics.comments + Math.floor(Math.random() * 5),
                reposts: post.analytics.reposts + Math.floor(Math.random() * 2),
            };
            resolve(newAnalytics);
        }, SIMULATED_LATENCY_MS / 2);
    });
}
