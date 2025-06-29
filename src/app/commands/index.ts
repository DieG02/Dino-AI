import { Telegraf } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { ExperienceType, UserExperience } from "../../models";
import { groupBy } from "../../lib/utils";
import { BOT_NAME } from "../../config/constants";

export default function registerCommands(bot: Telegraf<BotContext>) {
  bot.command("restart", async (ctx) => {
    // Clear the entire session for the current user
    ctx.session = {
      _init: {
        profile: true,
        experience: true,
      },
      profile: ctx.session.profile,
      experience: ctx.session.experience,
      draft: {},
    };

    if (ctx.scene && ctx.scene.current) {
      await ctx.scene.leave();
    }

    await ctx.reply(
      "All active processes have been restarted. You can start fresh now. Type /help to see available commands."
    );
  });

  bot.command("start", async (ctx: BotContext) => {
    const profile = ctx.session?.profile?.me;

    let displayUsername = "there";
    if (profile?.username) {
      displayUsername = profile.username;
    } else if (ctx.from?.first_name) {
      displayUsername = ctx.from.first_name;
    }

    await ctx.reply(
      `👋 Welcome, *${displayUsername}*!\n\n` +
        `I'm your LinkedIn Assistant Bot — here to help you stay consistent, proactive and visible on LinkedIn.\n\n` +
        `💡 Start by using /setprofile to tell me more about you.\n\n` +
        `ℹ️ You can always type /help to see all available commands.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      `📖 *${BOT_NAME} Help Menu*\n\n` +
        `🧑‍💼 *Profile & Setup*\n` +
        `  /setprofile – Configure your profile step-by-step\n` +
        `  /myprofile – View your saved profile\n` +
        `  /editprofile – _Update parts of your profile (coming soon)_\n` +
        `  /reset – _Clear your data and start over (coming soon)_\n\n` +
        `📝 *Job Hunt Tools*\n` +
        `  /applyto – Craft a message for a job post\n` +
        `  /referral – Ask someone for a referral\n` +
        `  /followup – Follow up after applying\n` +
        `  /cv – _Generate a PDF based on your profile (coming soon)_\n\n` +
        `📢 *Content Strategy*\n` +
        `  /writepost – Create a LinkedIn post idea\n` +
        `  /weeklypost – _Get weekly suggestions for posts (coming soon)_\n\n` +
        `♻️ Use /restart clear all the processes in background.\n` +
        `ℹ️ Use /info to learn more about the bot.\n\n` +
        `Need more help? Just type the command and I’ll guide you through it step-by-step 🦖`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("info", async (ctx) => {
    await ctx.reply(
      `🦖  *About ${BOT_NAME}:*\n\n` +
        `${BOT_NAME} is your *personal LinkedIn assistant* built right into Telegram. It's designed to *accelerate your job hunt*, help you *write better content*, and *stand out* to recruiters — all with a touch of smart automation.\n\n` +
        `💼  *Main Features:*\n\n` +
        `- Craft tailored *job applications* based on your profile and job post.\n` +
        `- Generate *follow-up* and *referral* messages that sound like you.\n` +
        `- Get weekly *content ideas* to stay active and visible.\n` +
        `- Keep a dynamic *LinkedIn profile* that evolves with your experience.\n\n` +
        `🚀  *Why ${BOT_NAME}?*\n\n` +
        `- It's fast, personal, and adapts to your goals.\n` +
        `- Designed to make you think less about “what to write” and more about *getting results*.\n\n` +
        `Start with /setprofile or type /help to explore all features!\n\n` +
        `Version: 1.0.0\n` +
        `Developer: [DieG02](https://bautista02.netlify.app/en)\n`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("myprofile", async (ctx) => {
    const profile = ctx.session.profile.me;
    const name = profile.firstName ? profile.firstName : profile.username;

    // 1. Send Basic Info
    await ctx.reply(
      `👤 *User:* ${name}\n` +
        `🪪 *Role:* ${profile.role}\n` +
        `🎯 *Main Goal:* ${profile.goal}\n` +
        `🌍 *Location:* ${profile.country || "Not set"}`,
      { parse_mode: "Markdown" }
    );

    // 2. Send Skills
    await ctx.reply(
      `*🛠 Tech Stack*\n${profile.techStack.join(" - ")}\n\n` +
        `*🗣 Languages*\n${profile.languages.join(" | ") || "Not specified"}`,
      { parse_mode: "Markdown" }
    );

    // 3. Group experiences by type and send
    const experiences = ctx.session.experience.all;
    const expByType = groupBy(experiences, "type");
    const label = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    for (const [type, exps] of Object.entries(expByType)) {
      await ctx.reply(
        `*${label(type)} experience Roadmap: *\n\n` +
          exps.map((exp) => formatExperience(exp)).join("\n\n"),
        { parse_mode: "Markdown" }
      );
    }

    // 4. Optional LinkedIn
    if (profile?.linkedinUrl) {
      await ctx.reply(`🔗 LinkedIn: ${profile.linkedinUrl}`);
    }
  });
}

// Helper functions
const formatExperience = (exp: UserExperience) => {
  const period = formatExperienceDate(exp.start as any, exp.end as any);

  return (
    `${getTypeIcon(exp.type)} *${exp.role}* at *${exp.company}*\n` +
    `${exp.location ? `📍 _${exp.location}_\n` : ""}` +
    `_📅 ${period}_\n\n` +
    `${exp.description ? `_${exp.description}_` : ""}` +
    `${exp.skills?.length ? `\n\n*${exp.skills.join(" • ")}*` : ""}`
  );
};

const formatExperienceDate = (start: string, end: string | null): string => {
  const formatted = (dateStr: string | null) => {
    if (dateStr == null) return "Present";
    const [month, year] = dateStr.split("/");
    const date = new Date(`${month}/01/${year}`);
    return date.toLocaleDateString("en-BR", {
      month: "short",
      year: "numeric",
    });
  };
  if (!start) return `Not provided`;

  return `${formatted(start)} - ${formatted(end)}`;
};

const getTypeIcon = (type: ExperienceType) => {
  const icons = {
    work: "💼",
    project: "📂",
    education: "🎓",
    volunteering: "🤝",
    other: "✨",
  };
  return icons[type];
};
