import { Telegraf } from "telegraf";
import { BotContext } from "../../models/telegraf";

export default function registerCommands(bot: Telegraf<BotContext>) {
  bot.command("start", async (ctx: BotContext) => {
    const profile = ctx.session?.profile;

    let displayUsername = "there";
    if (profile && profile.username) {
      displayUsername = profile.username;
    } else if (ctx.from?.first_name) {
      displayUsername = ctx.from.first_name;
    }

    await ctx.reply(
      `👋 Welcome, *${displayUsername}*\\!\n\n` +
        `I'm here to help you stay organized with your LinkedIn Account\\.\n\n` +
        `Use /setprofile to get started if you haven't already\\.`,
      { parse_mode: "Markdown" }
    );
  });
}
