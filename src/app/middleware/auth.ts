import { MiddlewareFn } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { ProfileManager } from "../../store/profile";
import { db } from "../../store";
import { Collection } from "../../config/constants";

export const authMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  if (!ctx.from?.id) throw new Error("No user context");
  if (!ctx.session) throw new Error("Session not initialized");

  try {
    if (ctx.session._init.profile) {
      return await next();
    }

    const telegramId = String(ctx.from.id);
    // Re-initialize with actual user data
    ctx.session.profile = new ProfileManager(telegramId);

    const userDocRef = db.collection(Collection.USERS).doc(telegramId);
    const user = await userDocRef.get();

    user.exists
      ? await ctx.session.profile.refresh()
      : await ctx.session.profile.create(ctx);

    ctx.session._init.profile = true;
    return await next();
  } catch (error) {
    ctx.session._init.profile = false;
    // Reset to empty instance if needed
    ctx.session.profile = new ProfileManager("");
    throw error;
  }
};
