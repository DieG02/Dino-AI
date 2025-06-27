import { Telegraf, session } from "telegraf";
import { BotContext } from "../models/telegraf";
import { authMiddleware } from "../app/middleware/auth";

import commandsHandler from "../app/commands";
import wizardsHandler from "../app/wizards";
import { restoreReminders } from "../config/cron";

export function setupBotApp(bot: Telegraf<BotContext>) {
  bot.use(
    session({
      defaultSession: () => ({
        profile: {} as BotContext["session"]["profile"],
        wizard: { state: {} },
        draft: {},
      }),
    })
  );

  // --- Middleware ---
  bot.use(async (ctx, next) => {
    try {
      await authMiddleware(ctx, next);
    } catch (err) {
      console.error("Auth failed:", err);
      await ctx.reply("Please authenticate first!");
    }
  });

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
