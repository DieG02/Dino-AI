import { MiddlewareFn } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { ExperienceManager } from "../../store/experience";

export const experienceMiddleware: MiddlewareFn<BotContext> = async (
  ctx,
  next
) => {
  if (!ctx.from?.id) throw new Error("Unauthorized");
  if (!ctx.session) throw new Error("Session not initialized");

  try {
    if (ctx.session._init.experience) {
      return await next();
    }

    const telegramId = String(ctx.from.id);
    // Re-initialize with actual user data
    ctx.session.experience = new ExperienceManager(telegramId);
    await ctx.session.experience.refresh();

    ctx.session._init.experience = true;
    return await next();
  } catch (error) {
    ctx.session._init.experience = false;
    // Reset to empty instance if needed
    ctx.session.experience = new ExperienceManager("");
    throw error;
  }
};
