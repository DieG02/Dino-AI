import { MiddlewareFn } from "telegraf";
import { Collection } from "../../config/constants";
import { ProfileManager } from "../../store/profile";
import { BotContext } from "../../models/telegraf";
import { db } from "../../store";

// This middleware will ensure ctx.session.profile is available
// It will try to load it from Firestore if not already in session.
export const authMiddleware: MiddlewareFn<BotContext> = async (
  ctx: BotContext,
  next: () => Promise<void>
) => {
  if (!ctx.from?.id) throw new Error("No user context");

  try {
    if (ctx.session._init?.profile) {
      ctx.session.profile.refresh();
      return await next();
    }
    const telegramId = String(ctx.from.id);
    const manager = new ProfileManager(telegramId);
    const userDocRef = db.collection(Collection.USERS).doc(telegramId);
    ctx.session.profile = manager;

    const user = await userDocRef.get();
    if (user.exists) {
      ctx.session.profile.refresh();
    } else {
      ctx.session.profile.create(ctx);
    }

    ctx.session._init.profile = true;
    return await next();
  } catch (error) {
    await ctx.reply(
      "There was an issue loading your profile. Please try /restart to fix it."
    );
    throw new Error("Session.Auth\n" + error);
  }
};

export const profileMiddleware: MiddlewareFn<BotContext> = async (
  ctx: BotContext,
  next: () => Promise<void>
) => {
  if (!ctx.session.profile.me) {
    await ctx.reply(
      "Please use /setprofile to complete your profile before continuing."
    );
    throw new Error("Session.Profile failed!");
  }

  return await next();
};
