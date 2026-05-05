import OpenAI from 'openai';

// Optional safety check (very useful for debugging)
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing in .env");
}

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
    "X-Title": "Team Task Manager",
  },
});

export const generateTaskSuggestions = async (projectDescription) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a project management expert. Generate realistic task suggestions based on project description. Return only JSON array of tasks with title, description, and estimated hours.'
        },
        {
          role: 'user',
          content: `Project: ${projectDescription}\nGenerate 5 relevant tasks for this project.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const content = completion.choices[0].message.content;
    // Parse JSON from response (handle potential markdown)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI suggestions');
  }
};

export const analyzeTaskComplexity = async (taskTitle, taskDescription) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze task complexity and return JSON: { priority: "low|medium|high|urgent", estimatedHours: number, riskFactors: string[] }'
        },
        {
          role: 'user',
          content: `Task: ${taskTitle}\nDescription: ${taskDescription}\nAnalyze complexity.`
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });
    
    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { priority: 'medium', estimatedHours: 4, riskFactors: [] };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return { priority: 'medium', estimatedHours: 4, riskFactors: [] };
  }
};

export const generateProjectSummary = async (projectName, tasks) => {
  try {
    const tasksSummary = tasks.map(t => `- ${t.title} (${t.status}): ${t.description}`).join('\n');
    
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a professional project summary highlighting progress, challenges, and recommendations.'
        },
        {
          role: 'user',
          content: `Project: ${projectName}\nTasks:\n${tasksSummary}\nGenerate a concise summary.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Summary Error:', error);
    return 'Unable to generate summary at this time.';
  }
};