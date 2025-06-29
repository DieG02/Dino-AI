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
        profile: {} as ProfileManager,
        experience: {} as ExperienceManager,
        wizard: { state: {} },
        draft: {},
      }),
    })
  );

  // --- Middleware ---

  bot.use(authMiddleware);
  bot.use(experienceMiddleware);

  // --- Error Handling ---
  bot.catch(async (err: unknown, ctx: BotContext) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    if (ctx.chat)
      await ctx.reply("Oops, something went wrong! Try to use /restart.");
  });

  // --- Handlers ---
  commandsHandler(bot);
  wizardsHandler(bot);

  // --- Setup CronJob ---
  restoreReminders();
}
