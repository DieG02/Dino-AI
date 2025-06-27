import { zodTextFormat } from "openai/helpers/zod";
import { UserProfile } from "../models";
import { Features } from "./index";
import { z } from "zod";

const zodInterface = z.object({
  text: z
    .string()
    .describe(
      "The full LinkedIn post content, including emojis and hashtags, ready for copy-pasting."
    ),
  type: z
    .enum(["insight", "project", "career", "question"])
    .describe(
      "The category of the LinkedIn post. Choose the most relevant type: 'insight' for general professional thoughts or tips, 'project' for updates on personal or work projects/achievements, 'career' for job-seeking, hiring, or professional development, 'question' for engaging the audience with a query."
    ),
  generatedWithAI: z.boolean(),
});

const schema = zodTextFormat(zodInterface, "WritePost");

const instructions = (profile: UserProfile) => `
  You are an expert LinkedIn content creator, specializing in professional and engaging posts.
  Your task is to generate **one** LinkedIn post as a JSON object, based on the user's topic and profile.

  ${JSON.stringify(profile, null, 2)}

  **Key Requirements for the 'text' field:**
  - The post content should be professional, insightful, and highly engaging.
  - Use an appropriate, concise, and impactful LinkedIn tone.
  - Incorporate emojis sparingly and effectively to enhance readability and engagement.
  - Include 3-5 relevant hashtags at the end of the post.
  - Aim for a concise length, suitable for LinkedIn (ideally 100-300 words).
  - Focus on driving engagement (e.g., asking a question, sharing a valuable insight, call to action).
  - The 'text' field should be ready to be copied and pasted directly onto LinkedIn without any additional remarks.

  **Example of expected JSON output:**
  \`\`\`json
  {
    "text": "Just wrapped up an incredible project on [Project Name]! 🚀 Building [feature/tech] was challenging but immensely rewarding. Loved diving deep into [specific tech/concept]. What's a recent project you're proud of? #SoftwareDev #WebDev #[YourTopic]",
    "type": "project",
    "generatedWithAI": true
  }
  \`\`\`
  Provide only the JSON object. Do NOT include any other text or remarks outside the JSON.
`;

const updateInstructions = (originalPost: object) => `
  You are a LinkedIn content editor. Take the following original LinkedIn post and incorporate the suggested edits.

  Original Post:
  ${JSON.stringify(originalPost, null, 2)}

  Update this LinkedIn post while keeping its core message. Follow the next user input changes:
  Return updated JSON in the same format, keeping all original fields. Document changes in a new 'changes' array.

  Example:
  \`\`\`json
  {
    "text": "[Improved version of original text]",
    "type": "[same or updated]",
    "generatedWithAI": true,
    "changes": ["Made tone more professional", "Added hashtags"]
  }
  \`\`\`
`;

export default {
  create: instructions,
  update: updateInstructions,
  schema,
} as Partial<Features>;
