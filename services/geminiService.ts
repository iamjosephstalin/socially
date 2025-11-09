import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY is not set. Gemini service will not work.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const generateTopicPrompt = (topic: string): string => {
    const prompts: Record<string, string[]> = {
        'Productivity Tip': [
            `a short, actionable productivity tip for professionals. Include 3-5 relevant hashtags like #Productivity and #CareerAdvice.`,
            `a LinkedIn post about a unique time management hack. Keep it under 280 characters and use #TimeManagement and #WorkSmarter.`,
            `an engaging post about overcoming procrastination. Ask a question to encourage comments. Use #Motivation and #ProductivityHacks.`,
            `a numbered list of 3 unconventional productivity tips for remote teams. End with a question asking for readers' favorite tools. Use hashtags #RemoteWork #Productivity.`,
            `a personal anecdote about a time a simple productivity hack made a huge difference on a project. Adopt an inspirational tone. Use #CareerGrowth #WorkSmarter.`,
            `a contrarian take on a popular productivity method (e.g., Inbox Zero). Explain why it doesn't always work and offer an alternative. Use #ProductivityHacks #FutureOfWork.`
        ],
        'Industry News': [
            `a summary of a recent major event or trend in the tech industry. Include a link placeholder like [link to article] and use #TechNews and #Innovation.`,
            `a LinkedIn post analyzing the impact of a new technology in the marketing sector. Ask for opinions. Use #Marketing and #FutureOfTech.`,
            `a post about a surprising new statistic related to remote work. Use #RemoteWork and #FutureOfWork.`,
            `an analysis of a recent major tech acquisition. Focus on the potential impact on consumers. Ask 'What are your predictions?'. Use #TechNews #Business.`,
            `a forward-looking post about three key trends to watch in the SaaS industry in the next year. Be specific and bold in your predictions. Use #Trends #SaaS #Future.`
        ],
        'Hiring Announcement': [
            `an enthusiastic hiring announcement for a [Your Role, e.g., Senior Software Engineer] position. Mention 2-3 exciting things about the company culture. Include #Hiring and #[YourCompany]Jobs. Add a placeholder [link to apply].`,
            `a post seeking a [Your Role, e.g., Product Manager]. Describe the ideal candidate's key trait. Use #JobOpening and #ProductManagement.`,
            `a warm announcement that your team is growing. Use #WeAreHiring and #JoinOurTeam.`,
            `a hiring post for a [Role] that focuses on the unique challenges and opportunities of the role, rather than just listing requirements. Mention the impact the person will have. Use #Hiring #JoinOurTeam.`,
            `a creative hiring post that starts with a question related to the role's domain. Mention 1-2 key perks that make your company special. Add placeholder [link to apply]. Use #JobOpening #[YourCompany]Careers.`
        ],
        'Company Update': [
            `a brief and exciting update about a new product launch or feature release. Include a call-to-action to check it out. Use #ProductLaunch and #SaaS.`,
            `a post celebrating a recent company milestone (e.g., anniversary, user goal). Thank the community. Use #Milestone and #ThankYou.`,
            `an announcement about a new partnership. Explain the key benefit for customers. Use #Partnership and #Growth.`,
            `a behind-the-scenes look at a new feature being developed. Build anticipation and ask for feedback. Use #ComingSoon #ProductDevelopment.`,
            `a post highlighting a positive customer success story or testimonial. Use #CustomerSuccess #CaseStudy.`
        ],
        'Personal Reflection': [
            `a short, personal reflection on a recent challenge and what was learned from it. Keep it authentic. Use #PersonalGrowth and #CareerJourney.`,
            `a post about a book that recently changed your perspective on leadership. Use #BookRecommendation and #Leadership.`,
            `a reflection on the importance of work-life balance, with one practical tip. Use #WorkLifeBalance and #MentalHealth.`,
            `a post sharing a valuable piece of career advice you received. Ask others to share theirs. Use #CareerAdvice #Mentorship.`,
            `a vulnerable share about a professional mistake and the lesson learned. Frame it constructively. Use #Learning #GrowthMindset.`
        ]
    };

    const topicPrompts = prompts[topic] || [`the topic: "${topic}"`];
    const randomIndex = Math.floor(Math.random() * topicPrompts.length);
    const selectedPrompt = topicPrompts[randomIndex];
    
    return `Act as a LinkedIn thought leader. Write a professional and engaging post for LinkedIn based on the following instruction: "${selectedPrompt}".
    Key requirements:
    1. Start with a strong, attention-grabbing hook.
    2. Keep the body concise and easy to read (use short paragraphs or bullet points).
    3. Include 3-5 relevant hashtags.
    4. End with an open-ended question or a clear call-to-action to drive engagement.
    5. Do not include any boilerplate introductory or concluding phrases like "Here is a post for you:".`;
}


export const generatePostSuggestion = async (topic: string): Promise<string> => {
  try {
    if (!ai) {
      return "API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.";
    }

    const prompt = generateTopicPrompt(topic);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating post suggestion:", error);
    return "Sorry, I couldn't generate a suggestion right now. Please try again later.";
  }
};