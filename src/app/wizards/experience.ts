import { Scenes, Markup } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { ExperienceType, UserExperience } from "../../models";
import { extract } from "../../config/openai";
import { Features, Service, ServicesMap } from "../../services";
import { getExperienceTemplate } from "../../lib/utils";
import { addExperience } from "../../store/experiences";

const experienceWizard = new Scenes.WizardScene<BotContext>(
  Wizard.EXPERIENCE,

  // Step 1: Select type
  async (ctx) => {
    await ctx.reply(
      "What type of experience would you like to add?",
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🛠 Project", "project"),
          Markup.button.callback("📚 Education", "education"),
        ],
        [
          Markup.button.callback("🤝 Volunteering", "volunteering"),
          Markup.button.callback("📝 Other", "other"),
        ],
        [Markup.button.callback("💼 Work", "work")],
      ])
    );

    ctx.wizard.state.data = {
      type: null,
      experience: null,
    };
    return ctx.wizard.next();
  },

  // Step 2: Get description
  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      await ctx.reply("Please try again and use the buttons provided.");
      return ctx.scene.leave();
    }
    const action = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    ctx.wizard.state.data!.type = action as ExperienceType;

    await ctx.editMessageText(
      `Write a short description of your ${action} experience. Ex:\n\n` +
        `“Worked as Frontend Dev at Google, 2022-2024. Focused on React + Typescript.”`,
      { parse_mode: "Markdown" }
    );
    return ctx.wizard.next();
  },

  // Step 3: Process and confirm
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("Please send a text description");
      return ctx.wizard.back();
    }

    const input = ctx.message?.text;

    const { schema, generate } = ServicesMap[Service.EXPERIENCE] as Features;

    const { experience }: { experience: UserExperience } = await extract({
      input: input,
      system: generate(),
      schema,
    });
    console.log(experience);
    ctx.wizard.state.data!.experience = experience;

    const summary = getExperienceTemplate(
      ctx.wizard.state.data!.type,
      experience
    );
    await ctx.reply(`${summary}\n\nConfirm to save?`, {
      parse_mode: "Markdown",
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("✅ Save", "save")],
        [Markup.button.callback("🔄 Redo", "redo")],
      ]).reply_markup,
    });
    return ctx.wizard.next();
  },

  // Step 4: Handle action
  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      await ctx.reply("Please use the buttons below 👇");
      return;
    }
    const action = ctx.callbackQuery.data;
    const experience = ctx.wizard.state.data!.experience;

    if (action === "save") {
      await addExperience(ctx.session.profile.uid, experience);
      console.log(experience);
      await ctx.editMessageText(
        "Experience saved! You can check your updates in your profile with /myprofile"
      );
    } else {
      await ctx.editMessageText("Let's try again...");
      ctx.wizard.selectStep(1);
      return;
    }
    return ctx.scene.leave();
  }
);

export default experienceWizard;
