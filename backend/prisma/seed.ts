import { PrismaClient, UserPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@socially.app' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@socially.app',
      hashedPassword: adminPassword,
      plan: UserPlan.ENTERPRISE,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Create demo users for different plans
  const demoUsers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      plan: UserPlan.FREE,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      plan: UserPlan.BASIC,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      plan: UserPlan.PRO,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
  ];

  for (const userData of demoUsers) {
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        hashedPassword: password,
        plan: userData.plan,
        isActive: true,
        avatarUrl: userData.avatar,
      },
    });

    // Create sample posts for each user
    const samplePosts = [
      {
        content: "🚀 Just launched a new feature in our SaaS platform! The automated content generation is a game-changer for busy professionals. #SaaS #Automation #LinkedIn",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
      {
        content: "💡 Pro tip: Consistency is key in social media marketing. That's why we built Socially - to help you maintain a professional presence without the daily hassle. #MarketingTips #Productivity",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      },
      {
        content: "📊 Analytics show that posts with authentic personal stories get 3x more engagement. What's your story? #PersonalBranding #Storytelling #LinkedInTips",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Three days from now
      },
    ];

    for (const postData of samplePosts) {
      await prisma.post.create({
        data: {
          userId: user.id,
          content: postData.content,
          scheduledAt: postData.scheduledAt,
          status: 'SCHEDULED',
          impressions: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 20) + 1,
          shares: Math.floor(Math.random() * 10),
          clicks: Math.floor(Math.random() * 100) + 10,
        },
      });
    }

    // Create sample automation for Pro and Enterprise users
    if (userData.plan === UserPlan.PRO || userData.plan === UserPlan.ENTERPRISE) {
      await prisma.automation.create({
        data: {
          userId: user.id,
          name: 'Weekly Industry Insights',
          topics: JSON.stringify(['AI', 'SaaS', 'Productivity', 'Technology']),
          frequency: 'weekly',
          time: '09:00',
          status: 'ACTIVE',
          nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        },
      });
    }

    // Create usage stats for current month
    const now = new Date();
    await prisma.usage.create({
      data: {
        userId: user.id,
        postsCreated: Math.floor(Math.random() * 20) + 5,
        postsScheduled: Math.floor(Math.random() * 15) + 3,
        aiGenerations: Math.floor(Math.random() * 30) + 10,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    console.log(`✅ Created user: ${userData.name} (${userData.email})`);
  }

  // Create some audit logs
  await prisma.auditLog.create({
    data: {
      action: 'USER_SIGNUP',
      entity: 'User',
      entityId: admin.id,
      details: {
        email: admin.email,
        plan: admin.plan,
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('Admin: admin@socially.app / admin123');
  console.log('User: john@example.com / password123 (FREE)');
  console.log('User: jane@example.com / password123 (BASIC)');
  console.log('User: mike@example.com / password123 (PRO)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });