import { zodTextFormat } from "openai/helpers/zod";
import { PromptContext } from "./index";
import { UserProfile } from "../models";
import { z } from "zod";

const zodInterface = z.object({
  promptUsed: z
    .string()
    .describe(
      "The exact user input or query that led to this post idea. This helps the user remember their original thought."
    ),
  content: z
    .string()
    .describe(
      "A concise and original LinkedIn Post idea (1-2 lines), tailored to the user's profile and sub-context. Incorporate relevant emojis."
    ),
  tags: z
    .enum(["bold", "funny", "technical", "story-driven", "thought-provoking"])
    .describe(
      "The primary tone or style of this LinkedIn Post Concept: 'thought-provoking' for deep insights or opinion pieces; 'story-driven' for personal anecdotes, journeys, or experiences; 'technical' for specific tech discussions, tutorials, or code insights; 'funny' for lighthearted, relatable humor; 'bold' for strong statements, challenges, or passionate declarations."
    ),
});

const IdeasOutputWrapperSchema = z.object({
  ideas: z
    .array(zodInterface)
    .describe(
      "An array containing 5 unique and high-quality LinkedIn post ideas, each conforming to the specified format."
    ),
});

const instructions = (profile: UserProfile, avoidedThemes: string[] = []) => {
  let avoidSection = "";
  if (avoidedThemes.length > 0) {
    avoidSection = `
      **Avoid repeating any of these specific themes or topics in your suggestions:**
      ${avoidedThemes.join("\n- ")}
    `;
  }

  return `
    You are LinkFlow AI, an expert content strategist for LinkedIn creators, specializing in generating highly relevant and engaging post ideas.

    Your goal is to provide **5 unique, high-quality LinkedIn post ideas** for the user based on their professional profile. Each idea must be:
    -   **Original and not generic.**
    -   **Highly relevant** to their industry, role, and skills.
    -   **Concise** (1-2 lines), providing just enough context to guide the post creation.
    -   **Distinct** from each other.

    This person's professional background is:
    -   **Industry:** ${profile.industry}
    -   **Current Role:** ${profile.role}
    -   **Skills:** ${profile.techStack.join(" | ")}
    ${
      profile.languages && profile.languages.length > 0
        ? `- Languages: ${profile.languages.join(" | ")}`
        : ""
    }
    ${profile.goal ? `- Goal: ${profile.goal}` : ""}

    **Vary the type of ideas (ensure you include one of each from this list):**
    -   **1 Technical Topic:** A specific technical insight, challenge, or best practice relevant to their skills.
    -   **1 Career Reflection:** An idea prompting reflection on their professional journey, growth, or a lesson learned.
    -   **1 Question for the Community:** An engaging question to spark discussion within their network.
    -   **1 Personal Story or Experience:** An idea for sharing a relatable personal anecdote or professional experience.
    -   **1 Quick Tip or Resource Share:** An idea for sharing a concise piece of advice, a tool, or a useful resource.

    ${avoidSection}

    **Example Output Concepts (follow this JSON array structure):**
    \`\`\`json
    [
      {
        "promptUsed": "I want to share my journey switching careers from marketing to software engineering.",
        "content": "🛠️ Break down how you structured your last React project and why — what patterns helped the most?",
        "tags": "technical"
      },
      {
        "promptUsed": "I want to share a technical tip about React performance optimization.",
        "content": "🌱 What was the hardest part of your career switch into dev work? Share what helped you push through.",
        "tags": "story-driven"
      },
      {
        "promptUsed": "I want to ask the community for their favorite CSS tricks.",
        "content": "❓ What’s a CSS trick you use all the time that you think other devs miss?",
        "tags": "thought-provoking"
      },
      {
        "promptUsed": "I want to share a personal story about launching my first product.",
        "content": "💬 Describe the first time you launched a product — what went wrong and what you learned.",
        "tags": "funny"
      },
      {
        "promptUsed": "I want to share a resource that helped me this week.",
        "content": "🔗 Share a GitHub repo or article that taught you something new this week and how you applied it.",
        "tags": "bold"
      }
    ]
    \`\`\`

    Provide only the JSON array of objects. Do NOT include any other text or remarks outside the JSON array.
  `;
};

const schema = zodTextFormat(IdeasOutputWrapperSchema, "WeeklyIdeaPost");
export const IdeasGenerator: Omit<PromptContext, "generate" | "update"> = {
  create: instructions,
  schema,
};
