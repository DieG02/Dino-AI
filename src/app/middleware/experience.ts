import { MiddlewareFn } from "telegraf";
import { ExperienceManager } from "../../models/experience";
import { BotContext } from "../../models/telegraf";

export const experienceMiddleware: MiddlewareFn<BotContext> = async (
  ctx,
  next
) => {
  if (!ctx.from?.id) throw new Error("Unauthorized");

  try {
    if (ctx.session._init?.experience) {
      ctx.session.experience.refresh();
      return await next();
    }

    const telegramId = String(ctx.from.id);
    const manager = new ExperienceManager(telegramId);

    ctx.session.experience = manager;
    ctx.session.experience.refresh();
    ctx.session._init.profile = true;

    return await next();
  } catch (error) {
    await ctx.reply(
      "There was an issue loading your profile experience. Please try again or use /experience."
    );
    throw new Error("Session.Experience\n" + error);
  }
};
