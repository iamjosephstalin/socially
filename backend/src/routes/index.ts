import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { PostsController } from '../controllers/postsController';
import { UserController } from '../controllers/userController';
import { AutomationController } from '../controllers/automationController';
import { SchedulerController } from '../controllers/schedulerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Auth routes (unprotected)
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/auth/linkedin/callback', AuthController.handleLinkedInCallback);

// Scheduler routes (for cronjobs - no auth required, but should be protected by API key)
router.post('/scheduler/process', SchedulerController.processScheduledPosts);
router.get('/scheduler/health', SchedulerController.healthCheck);

// Protected routes
router.use(authenticateToken);

// Protected auth routes (require authentication)
router.get('/linkedin', AuthController.getLinkedInAuth);

// Posts routes
router.get('/posts', PostsController.getPosts);
router.post('/posts', PostsController.createPost);
router.put('/posts/:postId', PostsController.updatePost);
router.delete('/posts/:postId', PostsController.deletePost);
router.post('/posts/:postId/publish', PostsController.postNow);
router.post('/posts/:postId/refresh-analytics', PostsController.refreshAnalytics);

// User routes
router.get('/user/me', UserController.getProfile);
router.put('/user/me', UserController.updateProfile);
router.delete('/user/me', UserController.deleteAccount);
router.post('/user/me/export', UserController.exportData);
router.post('/user/me/linkedin', UserController.connectLinkedIn);

// Automation routes
router.get('/automations', AutomationController.getAutomations);
router.post('/automations', AutomationController.createAutomation);
router.put('/automations/:automationId', AutomationController.updateAutomation);
router.delete('/automations/:automationId', AutomationController.deleteAutomation);

export default router;
