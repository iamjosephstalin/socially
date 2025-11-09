import { Post, User, Automation, PostStatus } from '../types';

export const initialUser: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  linkedinProfile: 'https://linkedin.com/in/alex-doe',
};

export const initialPosts: Post[] = [
  {
    id: 'post-1',
    content: "Just launched our new analytics dashboard! 🚀 So proud of the team's hard work. It's amazing to see data turn into actionable insights. What's one feature you can't live without in an analytics tool? #Data #Analytics #ProductLaunch",
    status: PostStatus.Posted,
    scheduledAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    postedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjAzNTV8MHwxfHNlYXJjaHwyfHxkYXNoYm9hcmR8ZW58MHx8fHwxNzE3ODI3ODMxfDA&ixlib=rb-4.0.3&q=80&w=1080',
    analytics: { impressions: 25432, likes: 1200, comments: 85, reposts: 45 },
  },
  {
    id: 'post-2',
    content: "Productivity hack: The '2-Minute Rule'. If a task takes less than two minutes, do it now. It's a simple way to stop procrastination and clear your to-do list. What's your favorite productivity hack? #Productivity #WorkSmarter #Motivation",
    status: PostStatus.Posted,
    scheduledAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    postedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    analytics: { impressions: 18765, likes: 980, comments: 62, reposts: 21 },
  },
  {
    id: 'post-3',
    content: "Excited to share that we're hiring a Senior Frontend Engineer to join our growing team! If you're passionate about building beautiful UIs with React and TypeScript, we'd love to hear from you. Apply here: [link] #Hiring #Frontend #React #Jobs",
    status: PostStatus.Scheduled,
    scheduledAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
    analytics: { impressions: 0, likes: 0, comments: 0, reposts: 0 },
  },
   {
    id: 'post-4',
    content: "Remote work is here to stay, but how do we maintain a strong company culture? It's all about intentionality: virtual coffee chats, clear communication channels, and celebrating wins together. How does your team build culture remotely? #RemoteWork #CompanyCulture",
    status: PostStatus.Scheduled,
    scheduledAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // tomorrow
    image: 'https://images.unsplash.com/photo-1589994237527-84d72491a529?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlbW90ZSUyMHdvcmt8ZW58MHx8MHx8fDA%3D',
    analytics: { impressions: 0, likes: 0, comments: 0, reposts: 0 },
  },
  {
    id: 'post-5',
    content: "Thinking about how AI will shape the future of content creation. It's not about replacing creators, but empowering them with better tools. The synergy between human creativity and machine intelligence is where the magic will happen. #AI #FutureOfWork #ContentCreation",
    status: PostStatus.Draft,
    scheduledAt: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    analytics: { impressions: 0, likes: 0, comments: 0, reposts: 0 },
  },
];


export const initialAutomations: Automation[] = [
    {
        id: 'auto-1',
        topic: 'Productivity Tip',
        frequency: 'Weekdays',
        time: '08:30',
        status: 'active'
    },
    {
        id: 'auto-2',
        topic: 'Industry News',
        frequency: 'Weekly',
        time: '11:00',
        status: 'paused'
    }
];