import { Markup, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { extract } from "../../config/openai";
import { mergeProfile } from "../../lib/utils";
import { UserProfile } from "../../models";
import { Features, Service, ServicesMap } from "../../services";

// Constants
const saveOrCancelButtons = Markup.inlineKeyboard([
  Markup.button.callback("❌ Cancel", "cancel_profile"),
  Markup.button.callback("💾 Save Now", "save_profile"),
]);

const coreFields: (keyof UserProfile)[] = [
  "role",
  "industry",
  "goal",
  "techStack",
];

// Helpers
const replyMarkdown = (ctx: BotContext, text: string) =>
  ctx.reply(text, { parse_mode: "Markdown" });

const formatProfile = (profile: Partial<UserProfile>) => {
  const techStack = profile.techStack?.join("\n- ") || "N/A";
  return (
    `📌 *Data Extracted*\n\n` +
    `*Goal:* _${profile.goal}_\n` +
    `*Role:* _${profile.role}_\n` +
    `*Industry:* _${profile.industry}_\n` +
    `*Tech Stack:*\n- ${techStack}\n\n` +
    `Add more _fields_ later with /experience`
  );
};

const promptMissingFields = (fields: (keyof UserProfile)[]) =>
  `⚠️ Sorry, we couldn't detect some fields...\n\n` +
  `Please tell me:${fields.map((f) => `\n- What's your *${f}?*`).join("")}`;

const setProfile = new Scenes.WizardScene<BotContext>(
  Wizard.SET_PROFILE,

  // Step 1: Ask user for profile description
  async (ctx) => {
    await replyMarkdown(
      ctx,
      `🎯 *Describe your professional profile in 2–3 sentences:*\n\n` +
        `Example: "I'm a Backend Engineer (Go/Python) in fintech, looking for remote roles in Europe."\n\n` +
        `I'll extract details and ask if anything's missing.`
    );
    return ctx.wizard.next();
  },

  // Step 2: Extract data using AI and ask for missing fields
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return await ctx.reply("❌ Please send text only.");
    }

    const inputText = ctx.message.text;
    ctx.wizard.state.profile ??= ctx.session.profile.me;

    // Retrieve the prompt string/function using the key
    const { generate, schema } = ServicesMap[Service.PROFILE] as Features;

    const temp = await ctx.reply("Extracting your core information...");
    const extracted = await extract({
      input: inputText,
      system: generate(),
      schema,
    });

    await ctx.telegram.editMessageText(
      ctx.session.profile.me.uid,
      temp.message_id,
      undefined,
      "Information extracted!"
    );

    ctx.wizard.state.profile = mergeProfile(
      ctx.wizard.state.profile,
      extracted
    );

    const missingFields = coreFields.filter(
      (field) => !ctx.wizard.state.profile[field]
    );

    if (missingFields.length > 0) {
      ctx.wizard.state.currentMissingField = missingFields[0];
      return await replyMarkdown(ctx, promptMissingFields(missingFields));
    }

    await replyMarkdown(ctx, formatProfile(ctx.wizard.state.profile));
    await ctx.reply(
      "☢️ Core Profile completed! Do you want to save it?",
      saveOrCancelButtons
    );

    return ctx.wizard.next();
  },

  // Step 3: Handle save or cancel
  async (ctx) => {
    const action =
      ctx.callbackQuery && "data" in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : null;

    if (!action) {
      return await ctx.reply("Please use the buttons below 👇");
    }

    switch (action) {
      case "save_profile":
        await ctx.session.profile.update(ctx.wizard.state.profile);
        await ctx.editMessageText("✅ Profile saved!");
        await ctx.reply(
          "Amazing! Now use /myprofile to review it or /experience to unlock more features."
        );
        break;
      case "cancel_profile":
        await ctx.editMessageText("❌ Profile discarded");
        await ctx.reply(
          "Don't forget to update it before start to avoid issues."
        );
        break;
    }

    return ctx.scene.leave();
  }
);

export default setProfile;
