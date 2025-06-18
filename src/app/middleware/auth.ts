import { MiddlewareFn } from "telegraf";
import { UserProfile } from "../../models";
import { BotContext } from "../../models/telegraf";
import { Timestamp } from "firebase-admin/firestore";
import { Collection } from "../../config/constants";
import { db } from "../../store";

// This middleware will ensure ctx.session.profile is available
// It will try to load it from Firestore if not already in session.
export const profileMiddleware: MiddlewareFn<BotContext> = async (
  ctx: BotContext,
  next: () => Promise<void>
) => {
  if (!ctx.from || !ctx.session) {
    return next();
  }

  const telegramId = String(ctx.from.id);
  const userDocRef = db.collection(Collection.USERS).doc(telegramId);

  try {
    if (!ctx.session.profile || Object.keys(ctx.session.profile).length === 0) {
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData) {
          ctx.session.profile = userData as UserProfile;
        } else {
          ctx.session.profile = {} as UserProfile;
        }
      } else {
        const newUser: UserProfile = {
          uid: telegramId,
          firstName: ctx.from?.first_name ?? "",
          lastName: ctx.from?.last_name ?? "",
          username: ctx.from?.username ?? "",
          role: "",
          industry: "",
          goal: "",
          techStack: [],
          languages: [],
          joinedAt: Timestamp.now(),
        };
        await userDocRef.set(newUser, { merge: true });
        ctx.session.profile = newUser;
      }
    }
  } catch (error) {
    await ctx.reply(
      "There was an issue loading or creating your profile. Please try again or use /setprofile."
    );
    ctx.session.profile = ctx.session.profile || ({} as UserProfile);
    return;
  }

  await next();
};
