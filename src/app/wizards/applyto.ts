import { Scenes, Markup } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { UserExperience } from "../../models";
import { extract } from "../../config/openai";
import { Features, Service, ServicesMap } from "../../services";

interface JobApplicationState {
  jobDescription: string;
  requirements: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  similarExperience?: UserExperience;
}

const applyToWizard = new Scenes.WizardScene<BotContext>(
  Wizard.APPLY_TO,

  // Step 1: Get job description
  async (ctx) => {
    await ctx.reply(`Please paste the job description you'd like to apply to:`);

    ctx.wizard.state.data = {
      application: {},
      messageId: null,
    };
    return ctx.wizard.next();
  },

  // Step 2: Analyze job description
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("Please send a text description");
      return ctx.wizard.back();
    }

    const jobDescription = ctx.message.text;
    ctx.wizard.state.data!.application = {
      jobDescription,
    } as JobApplicationState;

    const { generate, schema } = ServicesMap[Service.APPLY_TO] as Features;

    const extracted = await extract({
      input: jobDescription,
      system: generate(ctx.session.profile),
      schema,
    });

    console.log(extracted);
    ctx.wizard.state.data!.application = extracted;

    await ctx.reply(
      `Tip: _Use /experience to fill your work experience and get better results!_`,
      { parse_mode: "Markdown" }
    );
    await ctx.reply(`Application Package Done!\n\nRole: *${extracted.title}*`, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("💻 See Skills Summary", "show_skills")],
        [Markup.button.callback("💡 Interview Questions", "show_questions")],
        [Markup.button.callback("✉️ Show Cover Letter", "show_letter")],
        [Markup.button.callback("🏁 Finish!", "finish")],
      ]).reply_markup,
      parse_mode: "Markdown",
    });
    const template = await ctx.reply(
      `So, you want to apply for the role of *${extracted.title}*? Here’s what I have prepared for you...\n\n`,
      { parse_mode: "Markdown" }
    );
    ctx.wizard.state.data!.messageId = template.message_id;

    return ctx.wizard.next();
  },

  // Step 3: Handle experience question
  async (ctx) => {
    if (!("data" in ctx.callbackQuery!)) return;

    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;
    const action = ctx.callbackQuery.data;
    const { application } = ctx.wizard.state.data!;
    const messageId = ctx.wizard.state.data!.messageId;
    const chatId = ctx.session.profile.uid;

    switch (true) {
      case action === "show_skills":
        await ctx.telegram.editMessageText(
          chatId,
          messageId,
          undefined,
          `💻 Skills Summary:\n\n${application.summary}`,
          {
            parse_mode: "Markdown",
          }
        );
        break;

      case action === "show_questions":
        await ctx.telegram.editMessageText(
          chatId,
          messageId,
          undefined,
          "💡 *Suggested Interview Questions*\n" +
            application.questions
              .map((q: string, i: number) => `\n${i + 1}\. ${q}`)
              .join("\n"),
          { parse_mode: "Markdown" }
        );
        break;

      case action === "show_letter":
        ctx.telegram.editMessageText(
          chatId,
          messageId,
          undefined,
          `✉️  Cover letter already to copy and use it in your application:\n\n\`${application.letter}\``,
          {
            parse_mode: "Markdown",
          }
        );
        break;

      default:
        await ctx.answerCbQuery();
        await ctx.reply(
          "Thank you for using Dino AI! If you need further assistance, feel free to ask."
        );
        return ctx.scene.leave();
    }
    return;
  }
);

export default applyToWizard;
