import { Telegraf, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import setProfileWizard from "./setprofile";
import writePostWizard from "./writepost";
import { profileMiddleware } from "../middleware/auth";

const stage = new Scenes.Stage<BotContext>([setProfileWizard, writePostWizard]);

export default function registerWizards(bot: Telegraf<BotContext>) {
  bot.use(stage.middleware());

  bot.command("setprofile", (ctx) => ctx.scene.enter(Wizard.SET_PROFILE));
  bot.command("writepost", profileMiddleware, (ctx) =>
    ctx.scene.enter(Wizard.WRITE_POST)
  );
}

export { stage };
