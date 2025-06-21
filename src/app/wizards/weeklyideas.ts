import { Scenes, Markup } from "telegraf";
import { BotContext } from "../../models/telegraf";
import { extract } from "../../config/openai";
import { PromptContext, Service, ServicesMap } from "../../services";
import { Wizard } from "../../config/constants";
import { PostSuggestion } from "../../models";
import { callbackQuery } from "telegraf/filters";
import { SuggestionsManager } from "../../store/suggestions";

const buttons = Markup.inlineKeyboard([
  [Markup.button.callback("📝 Expand Idea 1", "expand_1")],
  [
    Markup.button.callback("📝 Expand Idea 2", "expand_2"),
    Markup.button.callback("📝 Expand Idea 3", "expand_3"),
  ],
  [
    Markup.button.callback("📝 Expand Idea 4", "expand_4"),
    Markup.button.callback("📝 Expand Idea 5", "expand_5"),
  ],
  [Markup.button.callback("🔄 Regenerate", "regenerate")],
  [
    Markup.button.callback("❌ Cancel", "cancel"),
    Markup.button.callback("💾 Save All", "save_all"),
  ],
]);

const weeklyIdeasWizard = new Scenes.WizardScene<BotContext>(
  Wizard.WEEKLY_IDEAS,

  // Step 1 - Interactive prompt with examples
  async (ctx) => {
    await ctx.reply(
      "✨ *Let's create viral LinkedIn content together\\!* ✨\n\n" +
        "Tell me about:\n" +
        "• Your target audience\n" +
        "• Key message\n" +
        "• Desired tone\n\n" +
        "Example:\n`Tech founders, funding strategies, bold`",
      {
        parse_mode: "Markdown",
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback("🎲 Show random example", "show_example"),
        ]).reply_markup,
      }
    );

    ctx.wizard.state.tempData! = {
      input: "",
      ideas: [],
      messageIds: [],
    };
    return ctx.wizard.next();
  },

  // Step 2 - Enhanced idea generation
  async (ctx) => {
    if (
      ctx.has(callbackQuery("data")) &&
      ctx.callbackQuery.data === "show_example"
    ) {
      await ctx.editMessageText(
        "Try this format:\n\n`Marketing pros, content repurposing, educational`"
      );
      return;
    }

    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("Please send text input or use /cancel");
      return;
    }

    const loadingMsg = await ctx.reply("🧠 Generating 5 custom ideas...");

    try {
      const { create, schema } = ServicesMap[
        Service.WEEKLY_IDEAS_GENERATION
      ] as PromptContext;
      const { ideas } = await extract({
        input: ctx.message.text,
        system: create(ctx.session.profile),
        schema,
      });

      // Store for later use
      ctx.wizard.state.tempData!.ideas = ideas;
      ctx.wizard.state.tempData!.input = ctx.message.text;

      // Delete loading message
      await ctx.deleteMessage(loadingMsg.message_id);

      // Send interactive results
      const ideasText = ideas
        .map(
          (idea: PostSuggestion, i: number) =>
            `*${i + 1}\.* ${idea.content}\n*\[${idea.tags}\]*`
        )
        .join("\n\n");

      const ideasMsg = await ctx.reply(
        `💎 *Your Custom Ideas* 💎\n\n${ideasText}`,
        {
          parse_mode: "Markdown",
          reply_markup: buttons.reply_markup,
        }
      );

      ctx.wizard.state.tempData!.messageIds.push(ideasMsg.message_id);
      return ctx.wizard.next();
    } catch (error) {
      console.error("Generation error:", error);
      await ctx.reply("🚨 Error generating ideas. Please try again later.");
      return ctx.scene.leave();
    }
  },

  // Step 3 - Dynamic action handling
  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;
    const action = ctx.callbackQuery.data;
    const { ideas, messageIds } = ctx.wizard.state.tempData!;

    try {
      switch (true) {
        case action.startsWith("expand_"):
          const index = parseInt(action.split("_")[1]) - 1;
          const idea = ideas[index];

          // Store in session with timestamp
          ctx.session.tempDraft = {
            [Wizard.WEEKLY_IDEAS]: {
              content: idea.content,
              type: idea.type,
              storedAt: Date.now(),
            },
          };

          await ctx.reply(
            `📝 *Expanded Idea Ready*\n\n` +
              `${idea.content}\n\n` +
              `✅ *Stored in memory, already to use!*\n` +
              `Just type: /writepost to use this content in a new post draft.`,
            { parse_mode: "Markdown" }
          );
          break;

        case action === "regenerate":
          await ctx.editMessageText("Generating fresh ideas...");
          return ctx.wizard.back();

        case action === "save_all":
          await ctx.answerCbQuery(
            "Ideas saved in your account!\n\nYou can check all of them using the command /store"
          );
          await Promise.all(
            ideas.map((idea: PostSuggestion) =>
              SuggestionsManager.add(ctx.session.profile.uid, idea)
            )
          );
          break;

        default:
          await ctx.answerCbQuery();
          return ctx.scene.leave();
      }
    } finally {
      // Clean up old messages
      await ctx.telegram.editMessageReplyMarkup(
        ctx.chat?.id,
        messageIds[0],
        undefined,
        undefined
      );
      return ctx.scene.leave();
    }
  }
);

export default weeklyIdeasWizard;
