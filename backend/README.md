# Socially Backend - LinkedIn Post Creator and Automator

A comprehensive backend API for the Socially SaaS application, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with LinkedIn OAuth integration
- **Post Management**: CRUD operations for LinkedIn posts with image support
- **Automation**: Scheduled posting and content automation
- **User Management**: Profile management and data export (GDPR compliant)
- **Background Jobs**: BullMQ with Redis for scheduled posts and automation
- **LinkedIn Integration**: Real LinkedIn API integration for posting and analytics

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Queue System**: BullMQ with Redis
- **File Upload**: Multer for image handling
- **API Integration**: LinkedIn API v2

## Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- LinkedIn Developer Account

## Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.template .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/socially_db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   
   # LinkedIn API
   LINKEDIN_CLIENT_ID="your-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
   LINKEDIN_REDIRECT_URI="http://localhost:3001/api/auth/linkedin/callback"
   
   # Redis (for BullMQ)
   REDIS_URL="redis://localhost:6379"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   
   # CORS
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Database Setup**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

4. **Start Services**:
   ```bash
   # Start Redis (if not running)
   redis-server
   
   # Start PostgreSQL (if not running)
   # Follow your OS-specific instructions
   
   # Start the backend
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/signup` - Create new user
- `POST /api/login` - User login
- `GET /api/linkedin` - Get LinkedIn OAuth URL
- `GET /api/linkedin/callback` - LinkedIn OAuth callback

### Posts
- `GET /api/posts` - Get user's posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post

### User Profile
- `GET /api/user/me` - Get user profile
- `PUT /api/user/me` - Update profile
- `DELETE /api/user/me` - Delete account
- `POST /api/user/me/export` - Export user data
- `POST /api/user/me/linkedin` - Connect LinkedIn account

### Automations
- `GET /api/automations` - Get user's automations
- `POST /api/automations` - Create automation
- `PUT /api/automations/:automationId` - Update automation
- `DELETE /api/automations/:automationId` - Delete automation

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `hashedPassword` (String)
- `avatarUrl` (String, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### LinkedIn Accounts Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key)
- `linkedinProfileId` (String)
- `accessToken` (String, Encrypted)
- `refreshToken` (String, Encrypted)
- `expiresAt` (DateTime)

### Posts Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key)
- `content` (Text)
- `status` (Enum: DRAFT, SCHEDULED, POSTED, ERROR)
- `scheduledAt` (DateTime)
- `postedAt` (DateTime, Nullable)
- `errorMessage` (String, Nullable)

### Post Images Table
- `id` (UUID, Primary Key)
- `postId` (Foreign Key)
- `imageUrl` (String)
- `order` (Integer)

### Automations Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key)
- `name` (String)
- `topics` (Array of Strings)
- `frequency` (String)
- `time` (String)
- `status` (Enum: ACTIVE, PAUSED)

## Background Jobs

The application uses BullMQ with Redis for handling:

1. **Scheduled Posts**: Automatically posts content to LinkedIn at scheduled times
2. **Automation Jobs**: Generates and posts automated content based on user-defined rules

## LinkedIn API Integration

### Required Permissions
- `r_liteprofile` - Read basic profile information
- `r_emailaddress` - Read email address
- `w_member_social` - Write posts to LinkedIn

### Setup LinkedIn App
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add the redirect URI: `http://localhost:3001/api/auth/linkedin/callback`
4. Request the required permissions
5. Copy Client ID and Client Secret to your `.env` file

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Use a strong, unique `JWT_SECRET`
- Set `NODE_ENV=production`
- Use production database URL
- Configure production Redis URL
- Set production frontend URL for CORS

### Database
- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Run migrations: `npm run db:migrate`
- Ensure proper backup strategy

### Redis
- Use a managed Redis service (AWS ElastiCache, Google Cloud Memorystore, etc.)
- Configure persistence and backup

### Security
- Enable HTTPS
- Use environment variables for secrets
- Implement rate limiting
- Add request validation
- Use helmet for security headers

## Monitoring

- Health check endpoint: `GET /health`
- Monitor BullMQ queues
- Set up logging and error tracking
- Monitor database performance
- Track API usage and limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
