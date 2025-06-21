import { Telegraf, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { profileMiddleware } from "../middleware/auth";

import setProfileWizard from "./setprofile";
import writePostWizard from "./writepost";
import weeklyIdeasWizard from "./weeklyideas";

const stage = new Scenes.Stage<BotContext>([
  setProfileWizard,
  writePostWizard,
  weeklyIdeasWizard,
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
}

export { stage };
