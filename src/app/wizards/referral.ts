import { Scenes } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { extract } from "../../config/openai";
import { Markup } from "telegraf";
import { Wizard } from "../../config/constants";
import { Features, Service, ServicesMap } from "../../services";

interface ReferralState {
  jd?: any;
  referralType?: "employee" | "recrutier" | "info" | null;
  message?: string;
}

const buttons = [
  [Markup.button.callback("👥 Ask for Referral", "dm_employee")],
  [Markup.button.callback("🎯 Message Recruiter", "dm_recruiter")],
  [Markup.button.callback("💬 Info about a Company", "dm_info")],
];

export const referralWizard = new Scenes.WizardScene<BotContext>(
  Wizard.REFERRAL,

  // Step 0: Initialize data
  async (ctx) => {
    await ctx.reply(
      "What kind of message would you want to send?",
      Markup.inlineKeyboard(buttons)
    );

    ctx.wizard.state.data = {
      jd: null,
      message: "",
      referralType: null,
    } as ReferralState;

    return ctx.wizard.next();
  },

  // Step 1: Create Job Oppportunity Summary
  async (ctx) => {
    if (!("data" in ctx.callbackQuery!))
      return await ctx.reply("Unexpected callback type.");

    const type = ctx.callbackQuery.data.replace("dm_", "");
    if (type == "cancel") {
      delete ctx.session.draft[Wizard.REFERRAL];
      await ctx.reply(
        "Stage cleaned. Try /help to explore all the commands available!"
      );
      return await ctx.scene.leave();
    }
    ctx.wizard.state.data.referralType = type;

    if (ctx.session.draft[Wizard.REFERRAL]) {
      const jd = ctx.session.draft[Wizard.REFERRAL];
      ctx.wizard.state.data.jd = jd;
      await ctx.reply(
        `We found the job description for the *${jd.title}* position at *${jd.company}* already to use!`,
        {
          parse_mode: "Markdown",
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback("Enter new JD", "new_one"),
            Markup.button.callback("Continue", "continue"),
          ]).reply_markup,
        }
      );
      return ctx.wizard.next();
    }

    await ctx.reply(
      "Please enter the job description for the role you're applying for:"
    );
    return ctx.wizard.next();
  },

  // Step 2: Generate DM Message
  async (ctx) => {
    if (ctx.callbackQuery && "data" in ctx.callbackQuery) {
      const action = ctx.callbackQuery.data;
      await ctx.answerCbQuery();

      if (action === "new_one") {
        await ctx.reply(
          "Please enter the job description for the role you're applying for:"
        );
        ctx.wizard.state.data.jd = null;
        return;
      }
      if (action === "continue") {
        await ctx.reply("Great! Proceeding with the existing job description.");
      }
    }

    let jd_summary = ctx.wizard.state.data.jd;
    const profile = ctx.session.profile.me;
    const experiences = ctx.session.experience.all;
    const type = ctx.wizard.state.data.referralType;

    if (!jd_summary) {
      if (!ctx.message || !("text" in ctx.message))
        return await ctx.reply("Please send a text message");

      const input = ctx.wizard.state.data.jd || ctx.message.text;

      const { generate: generate_jd, schema: schema_jd } = ServicesMap[
        Service.JOB_DESCRIPTION
      ] as Features;

      jd_summary = await extract({
        input: input,
        system: generate_jd(),
        schema: schema_jd,
      });
    }
    const status = await ctx.reply(
      "Extracting all the information from the JD..."
    );

    ctx.session.draft = {
      ...ctx.session.draft,
      [Wizard.REFERRAL]: {
        ...jd_summary,
        storedAt: Date.now(),
      },
    };

    await ctx.telegram.editMessageText(
      profile.uid,
      status.message_id,
      undefined,
      "Information extracted successfully.\n✍️ Generating your message..."
    );

    const { create, schema } = ServicesMap[Service.REFERRAL] as Features;

    const extracted = await extract({
      input: "",
      system: create({
        type,
        profile,
        experiences,
        jd: jd_summary,
      }),
      schema,
    });

    await ctx.telegram.editMessageText(
      profile.uid,
      status.message_id,
      undefined,
      "Generation completed!"
    );

    if (experiences.length < 2)
      await ctx.reply(
        `Tip: _Use /experience to fill your work experience and get better results!_`,
        { parse_mode: "Markdown" }
      );

    await ctx.reply(`✅ Here's your ${type} DM:\n\n\`${extracted.text}\``, {
      parse_mode: "Markdown",
    });

    await ctx.reply("Would you like to generate a new type message?", {
      reply_markup: Markup.inlineKeyboard([
        ...buttons,
        [Markup.button.callback("❌ Cancel", "dm_cancel")],
      ]).reply_markup,
    });
    return ctx.wizard.selectStep(1);
  }
);

export default referralWizard;
