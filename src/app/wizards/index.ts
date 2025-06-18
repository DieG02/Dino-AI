import { Telegraf, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import setProfileWizard from "./setprofile";

const stage = new Scenes.Stage<BotContext>([setProfileWizard]);

export default function registerWizards(bot: Telegraf<BotContext>) {
  bot.use(stage.middleware());

  bot.command("setprofile", (ctx) => ctx.scene.enter(Wizard.SET_PROFILE));
}

export { stage };
