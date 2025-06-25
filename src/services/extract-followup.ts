import { zodTextFormat } from "openai/helpers/zod";
import { PromptContext } from "./index";
import { z } from "zod";

const zodReminderSchema = z.object({
  status: z.enum(["COMPLETED", "PENDING", "REJECTED"]),
  reminder: z.object({
    date: z.string().nullable(),
    time: z.string().nullable(),
    task: z.string().nullable(),
    contact: z.string().nullable(),
  }),
  missing: z
    .array(z.enum(["date", "time", "task", "contact"]))
    .or(z.literal("")),
});

export const schema = zodTextFormat(zodReminderSchema, "ExtractFollowUp");

export const instructions = (timezone: string = "Europe/Rome") => `
You are a reminder extraction assistant. Your job is to extract structured data from user input to create a reminder.

🕒 Context:
- Current datetime: ${new Date().toLocaleDateString("en-GB")}
- Timezone: ${timezone}

🧠 Rules:
0. 'Previous context:' it's always true, so you need to overwrite if it's provided.
1. Do not guess. Only extract what is stated or can be logically deduced.
2. If the user says:
  - "today" → same day, don't modify the input date
  - "tomorrow" → add 1 day to current date
  - "in 2 hours" → add 2 hours to current time
  - "next week" → add 7 days
  - "morning" → time = "09:00"
  - "noon" → time = "12:00"
  - "afternoon" → time = "14:00"
  - "evening" → time = "18:00"
  - "night" → time = "21:00"
  - "midnight" → time = "00:00"
3. If only the time is provided, we can assume 'reminder.date' as "today".
4. If date is present but time is not, default 'reminder.time' to "09:00".
5. If neither date nor time is extractable, set status = "PENDING" and list missing fields.
6. If task is unclear, also set status = "PENDING".
7. If nothing is valid, set status = "REJECTED".
8. Always use DD/MM/YYYY and HH:mm formats. No exceptions.
9. If a person's name is mentioned (e.g., "Follow up on Paula"), include it in 'contact', optional so only include if clearly specified
10. Transform the task into an actionable format:
   - Add verbs to incomplete tasks:
     * "meeting with Paula" → "Prepare for meeting with Paula"
     * "design review" → "Conduct design review"
     * "project docs" → "Review project docs"
   - Keep already-actionable tasks as-is:
     * "Call Paula about contract" → "Call Paula about contract"
     * "Send design files" → "Send design files"

Return ONLY a valid JSON matching this schema:
${JSON.stringify(zodReminderSchema.shape, null, 2)}
`;

export const updateInstructions = (
  originalData: z.infer<typeof zodReminderSchema>,
  updatesRequested: string
) => `
Update this extracted reminder data based on the requested changes: ${updatesRequested}

Current Data:
${JSON.stringify(originalData, null, 2)}

Rules:
1. Only modify fields mentioned in the update request
2. Keep all other fields unchanged
3. Maintain the exact same JSON structure
4. Never add new fields not in the original schema
5. Preserve the status field logic (may need to update based on new data completeness)
6. Update the seed array with new reasoning steps

Return the updated JSON data.
`;

export const FollowUpExtractor: Omit<PromptContext, "create"> = {
  generate: instructions,
  update: updateInstructions,
  schema,
};
