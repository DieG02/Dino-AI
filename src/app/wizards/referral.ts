import { Scenes } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { extract } from "../../config/openai";
import { Markup } from "telegraf";
import { UserProfile } from "../../models";
import { Wizard } from "../../config/constants";
import { PromptContext, Service, ServicesMap } from "../../services";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

interface ReferralState {
  jd?: any;
  selectedExperience?: any;
  referralType?: "employee" | "recrutier" | "info" | null;
  generatedMessage?: string;
}

export const referralWizard = new Scenes.WizardScene<BotContext>(
  Wizard.REFERRAL,

  // Step 0: Initialize tempData
  async (ctx) => {
    await ctx.reply(
      "Please paste the full job description for the role you're applying for:"
    );

    ctx.wizard.state.tempData = {
      jd: null,
      referralType: null,
      selectedExperience: null,
      generateMessage: "",
    } as ReferralState;

    return ctx.wizard.next();
  },

  // Step 1: Create Job Oppportunity Summary
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return await ctx.reply("Please send a text message");
    }

    if (!ctx.session.tempDraft?.[Wizard.REFERRAL]) {
      const { generate } = ServicesMap[
        Service.REFERRAL_GENERATION
      ] as PromptContext;

      const JDSchema = z.object({
        title: z.string(),
        company: z.string(),
        skills: z.array(z.string()),
        experiences: z.string(),
        stack: z.array(z.string()),
      });

      const schema = zodTextFormat(JDSchema, "ReferralJobDescription");

      const userInput = ctx.message.text;
      const extracted = await extract({
        input: userInput,
        system: generate(),
        schema: schema as any,
      });

      // Store in session with timestamp
      ctx.session.tempDraft = {
        ...ctx.session.tempDraft,
        [Wizard.REFERRAL]: {
          ...extracted,
          storedAt: Date.now(),
        },
      };
      ctx.wizard.state.tempData!.jd = extracted;

      console.log(extracted);
    } else {
      const jd = ctx.session.tempDraft![Wizard.REFERRAL];
      ctx.wizard.state.tempData!.jd = jd;
      await ctx.reply(
        `We found the job description for the *${jd.title}* position at *${jd.company}* already to use!`,
        { parse_mode: "Markdown" }
      );
    }

    await ctx.reply(
      "What kind of DM do you want to send?",
      Markup.inlineKeyboard([
        [Markup.button.callback("👥 Ask for Referral", "dm_employee")],
        [Markup.button.callback("🎯 Message Recruiter", "dm_recruiter")],
        [Markup.button.callback("💬 Informational Interview", "dm_info")],
      ])
    );
    return ctx.wizard.next();
  },

  // Step 2: Generate DM Message
  async (ctx) => {
    if (!("data" in ctx.callbackQuery!)) {
      await ctx.reply("Unexpected callback type.");
      return;
    }
    const dmType = ctx.callbackQuery.data.replace("dm_", "");
    ctx.wizard.state.tempData!.referralType = dmType;
    ctx.wizard.state.tempData!.selectedExperience = null;

    await ctx.reply(
      `Tip: _Use /experience to fill your work experience and get better results!_`,
      { parse_mode: "Markdown" }
    );

    const { profile } = ctx.session;
    const { referralType, selectedExperience, jd } = ctx.wizard.state.tempData!;

    const update = await ctx.reply("✍️ Generating your message...");

    const { schema, create } = ServicesMap[
      Service.REFERRAL_GENERATION
    ] as PromptContext;

    const result = await extract({
      input: "",
      system: create(
        referralType,
        profile as UserProfile,
        jd,
        selectedExperience
      ),
      schema,
    });

    ctx.wizard.state.tempData!.generatedMessage = result.text;

    await ctx.telegram.editMessageText(
      ctx.session.profile.uid,
      update.message_id,
      undefined,
      `✅ Here's your generated DM:\n\n\`${result.text}\``,
      { parse_mode: "Markdown" }
    );
    delete ctx.session.tempDraft![Wizard.REFERRAL];

    return ctx.wizard.next();
  }
);

export default referralWizard;
