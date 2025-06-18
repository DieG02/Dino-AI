import { Telegraf, session } from "telegraf";
import { BotContext } from "../models/telegraf";
import { profileMiddleware } from "../app/middleware/auth";

import commandsHandler from "../app/commands";
import wizardsHandler from "../app/wizards";

export function setupBotApp(bot: Telegraf<BotContext>) {
  bot.use(session());
  bot.use(profileMiddleware);

  // --- Error Handling ---
  bot.catch((err: unknown, ctx: BotContext) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    if (ctx.chat) {
      ctx.reply("Oops, something went wrong!");
    }
  });

  // --- Handlers ---
  commandsHandler(bot);
  wizardsHandler(bot);
}
