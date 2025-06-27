import { Scenes, Markup } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { extract } from "../../config/openai";
import { parseCommand, parseDatetime } from "../../lib/utils";
import { addReminder, getReminders } from "../../store/reminders";
import { Features, Service, ServicesMap } from "../../services";

const followupWizard = new Scenes.WizardScene<BotContext>(
  Wizard.FOLLOW_UP,

  // Step 1: Parse initial input
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message))
      return await ctx.reply("❌ Please send a text message");
    const text = ctx.message?.text || "";
    const { topic } = parseCommand(text);

    if (!topic) {
      const allReminders = await getReminders(ctx.session.profile.uid);

      const myReminders = allReminders
        .map(
          ({ datetime, task }) =>
            `📌 ${task} at ${datetime.toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}`
        )
        .join("\n");

      if (allReminders.length > 0)
        await ctx.reply(
          "Here are all your pending follow ups:\n\n" + myReminders,
          { parse_mode: "MarkdownV2" }
        );
      else
        await ctx.reply(
          "📭 No pending follow-ups right now.\n" +
            "To add one, just use:\n/followup <name> <task> <datetime>"
        );

      return ctx.scene.leave();
    }

    const { schema, generate } = ServicesMap[Service.FOLLOW_UP] as Features;

    const { reminder } = await extract({
      input: topic,
      system: generate(),
      schema,
    });

    const { task, date, time, contact } = reminder;

    if (!task || !date || !time || !contact) {
      await ctx.reply(
        "⚠️ Please use format: /followup <name> <reason> <DD-MM-YYYY>"
      );
      return;
    }

    ctx.wizard.state.data = {
      task,
      date,
      time,
      contact,
    };

    await ctx.reply(
      `Confirm follow-up:\n\n` +
        `🔹 *Follow Up:* ${contact}\n` +
        `📌 *About:* ${task}\n` +
        `🗓️ *Date:* ${date}\n` +
        `⏰ *Time:* ${time}`,
      {
        parse_mode: "Markdown",
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback("✅ Confirm and schedule", "confirm")],
          [Markup.button.callback("❌ Cancel", "cancel")],
        ]).reply_markup,
      }
    );
    return ctx.wizard.next();
  },

  // Step 2: Handle confirmation
  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      await ctx.reply("Please use the buttons to confirm or cancel");
      return;
    }

    const action = ctx.callbackQuery.data;

    if (action === "confirm") {
      const { task, date, time, contact } = ctx.wizard.state.data!;
      await addReminder({
        datetime: parseDatetime(date, time).dateFormat,
        chatId: ctx.session.profile.uid,
        task,
        contact,
      });
      await ctx.editMessageText("📌 Follow-up reminder scheduled!");
    } else {
      await ctx.editMessageText("❌ Follow-up canceled");
    }

    return ctx.scene.leave();
  }
);

export default followupWizard;
