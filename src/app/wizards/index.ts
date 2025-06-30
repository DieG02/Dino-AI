import { Telegraf, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";

import setProfileWizard from "./setprofile";
import experienceWizard from "./experience";
import writePostWizard from "./writepost";
import weeklyIdeasWizard from "./weeklyideas";
import applyToWizard from "./applyto";
import referralWizard from "./referral";
import followupWizard from "./followup";

const stage = new Scenes.Stage<BotContext>([
  setProfileWizard,
  experienceWizard,
  writePostWizard,
  weeklyIdeasWizard,
  applyToWizard,
  referralWizard,
  followupWizard,
]);

function safeEnter(sceneId: string) {
  return async (ctx: BotContext) => {
    try {
      await ctx.scene.enter(sceneId);
    } catch (err) {
      await ctx.reply(`❌ Couldn't start that flow. Please try again later.`);
      throw new Error(`🔐 Failed to enter scene [${sceneId}]`);
    }
  };
}

export default function registerWizards(bot: Telegraf<BotContext>) {
  bot.use(stage.middleware());
  bot.command("setprofile", safeEnter(Wizard.SET_PROFILE));
  bot.command("experience", safeEnter(Wizard.EXPERIENCE));
  bot.command("writepost", safeEnter(Wizard.WRITE_POST));
  bot.command("weeklyideas", safeEnter(Wizard.WEEKLY_IDEAS));
  bot.command("applyto", safeEnter(Wizard.APPLY_TO));
  bot.command("referral", safeEnter(Wizard.REFERRAL));
  bot.command("followup", safeEnter(Wizard.FOLLOW_UP));
}

export { stage };
