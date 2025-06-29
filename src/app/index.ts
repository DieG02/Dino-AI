import { Telegraf, session } from "telegraf";
import { BotContext } from "../models/telegraf";
import { authMiddleware } from "../app/middleware/auth";
import { experienceMiddleware } from "./middleware/experience";

import commandsHandler from "../app/commands";
import wizardsHandler from "../app/wizards";
import { restoreReminders } from "../config/cron";
import { ProfileManager } from "../models/profile";
import { ExperienceManager } from "../models/experience";

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
    if (ctx.chat) await ctx.reply("Oops, something went wrong!");
  });

  // --- Handlers ---
  commandsHandler(bot);
  wizardsHandler(bot);

  // --- Setup CronJob ---
  restoreReminders();
}
