import { Telegraf, session } from "telegraf";
import { BotContext } from "../models/telegraf";
import { authMiddleware } from "../app/middleware/auth";
import { ProfileManager } from "../store/profile";
import { experienceMiddleware } from "./middleware/experience";
import { ExperienceManager } from "../store/experience";

import commandsHandler from "../app/commands";
import wizardsHandler from "../app/wizards";
import { restoreReminders } from "../config/cron";

export function setupBotApp(bot: Telegraf<BotContext>) {
  bot.use(
    session({
      defaultSession: () => ({
        _init: {
          profile: false,
          experience: false,
        },
        profile: new ProfileManager(""),
        experience: new ExperienceManager(""),
        wizard: { state: {} },
        draft: {},
      }),
    })
  );

  // --- Middleware ---

  bot.use(authMiddleware);
  bot.use(experienceMiddleware);

  // --- Error Handling ---
  // In setupBotApp.ts
  bot.catch(async (err: unknown, ctx: BotContext) => {
    console.error(`[BotError] ${ctx.updateType}:`, err);

    if (ctx.chat) {
      await ctx.reply(
        "⚠️ Operation failed. Use /restart to reset your session."
      );
      // Reset problematic session parts
      if (ctx.session) {
        ctx.session._init.profile = false;
        ctx.session._init.experience = false;
      }
    }
  });

  // --- Handlers ---
  commandsHandler(bot);
  wizardsHandler(bot);

  // --- Setup CronJob ---
  restoreReminders();
}
