import { MiddlewareFn } from "telegraf";
import { Collection } from "../../config/constants";
import { ProfileManager } from "../../models/profile";
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
    if (ctx.session.profile?.me && Object.keys(ctx.session.profile?.me)) {
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
  } catch (error) {
    console.error("Error loading or creating user profile:", error);
    await ctx.reply(
      "There was an issue loading or creating your profile. Please try again or use /setprofile."
    );
    return;
  }
  return await next();
};

export const profileMiddleware: MiddlewareFn<BotContext> = async (
  ctx: BotContext,
  next: () => Promise<void>
) => {
  if (!Object.keys(ctx.session.profile?.me).length) {
    await ctx.reply(
      "Please complete your profile using /setprofile before continuing."
    );
    return;
  }

  return await next();
};
