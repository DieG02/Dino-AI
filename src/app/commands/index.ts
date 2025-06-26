import { Telegraf } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { ExperienceType, UserExperience } from "../../models";
import { groupBy } from "../../lib/utils";
import { getProfile } from "../../store/user";

export default function registerCommands(bot: Telegraf<BotContext>) {
  bot.command("reset", async (ctx) => {
    // Clear the entire session for the current user
    ctx.session = {
      profile: ctx.session?.profile,
      tempDraft: {},
    };

    if (ctx.scene && ctx.scene.current) {
      await ctx.scene.leave();
    }

    await ctx.reply(
      "All active processes have been reset. You can start fresh now. Type /start or /help to see available commands."
    );
  });

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

  bot.command("myprofile", async (ctx) => {
    const { id, profile, experiences } = await getProfile(
      ctx.session.profile.uid
    );
    const fullName =
      profile.firstName && profile.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : "";

    // 1. Send Basic Info
    await ctx.reply(
      `👤 *User:* ${fullName || profile.username}\n` +
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
    const expByType = groupBy(experiences, "type");

    for (const [type, exps] of Object.entries(expByType)) {
      await ctx.reply(
        `*Experience Roadmap: *\n\n` +
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
  // const period = "Not format";
  // console.log(exp.start, exp.end);

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
    const date = new Date(`01/${month}/${year}`);
    return date.toLocaleDateString("en-BR", {
      month: "short",
      year: "numeric",
    });
  };

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
