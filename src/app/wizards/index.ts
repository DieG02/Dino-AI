import { Telegraf, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { profileMiddleware } from "../middleware/auth";

import setProfileWizard from "./setprofile";
import writePostWizard from "./writepost";
import weeklyIdeasWizard from "./weeklyideas";
import applyToWizard from "./applyto";
import referralWizard from "./referral";
import followupWizard from "./followup";

const stage = new Scenes.Stage<BotContext>([
  setProfileWizard,
  writePostWizard,
  weeklyIdeasWizard,
  applyToWizard,
  referralWizard,
  followupWizard,
]);

export default function registerWizards(bot: Telegraf<BotContext>) {
  bot.use(stage.middleware());

  bot.command("setprofile", (ctx) => ctx.scene.enter(Wizard.SET_PROFILE));
  bot.command("writepost", profileMiddleware, (ctx) =>
    ctx.scene.enter(Wizard.WRITE_POST)
  );
  bot.command("weeklyideas", profileMiddleware, (ctx) =>
    ctx.scene.enter(Wizard.WEEKLY_IDEAS)
  );
  bot.command("applyto", profileMiddleware, (ctx) =>
    ctx.scene.enter(Wizard.APPLY_TO)
  );
  bot.command("referral", profileMiddleware, (ctx) =>
    ctx.scene.enter(Wizard.REFERRAL)
  );
  bot.command("followup", profileMiddleware, (ctx) =>
    ctx.scene.enter(Wizard.FOLLOW_UP)
  );
}

export { stage };
