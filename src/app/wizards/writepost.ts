import { Markup, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import { BotContext } from "../../models/telegraf";
import { extract } from "../../config/openai";
import { parseCommand } from "../../lib/utils";
import { Features, Service, ServicesMap } from "../../services";
import { PostManager } from "../../store/posts";

async function displayPost(ctx: BotContext) {
  const currentPost =
    ctx.wizard.state.data!.generatedPosts[ctx.wizard.state.data!.currentIndex];
  if (!currentPost) {
    await ctx.reply("No post found. Something went wrong.");
    return ctx.scene.leave();
  }

  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback("🗑️ Cancel", "writepost_cancel")],
    [
      Markup.button.callback("✍️ Edit", "writepost_edit"),
      Markup.button.callback("🔄 Next", "writepost_next"),
    ],
    [Markup.button.callback("✅ Confirm & Use This", "writepost_confirm")],
  ]);

  await ctx.reply(
    `Here's LinkedIn post option ${
      ctx.wizard.state.data!.currentIndex + 1
    } for you:`
  );
  const message = await ctx.reply(currentPost.text, buttons);
  ctx.wizard.state.data.messageId = message.message_id;
}

const writePostWizard = new Scenes.WizardScene<BotContext>(
  Wizard.WRITE_POST,

  // Step 1: Generate and show first post
  async (ctx: BotContext) => {
    if (!ctx.message || !("text" in ctx.message))
      return await ctx.reply("❌ Please send a text message");

    let { topic } = parseCommand(ctx.message?.text);
    if (!topic) {
      const draft = ctx.session.draft?.[Wizard.WEEKLY_IDEAS];
      if (draft && draft.content) {
        await ctx.reply(`📋 Using your saved draft:\n\n_${draft.content}_`, {
          parse_mode: "Markdown",
        });
        topic = draft.content;
      } else {
        // By default we don't want to let user use \writepost only [reservated for draft data]
        await ctx.reply(
          "Please provide a topic after the `/writepost` command (e.g., _`/writepost` my new project_).",
          { parse_mode: "Markdown" }
        );
        return ctx.scene.leave();
      }
    }

    await ctx.reply(
      "✍️ Generating your LinkedIn post suggestions... Please wait."
    );

    try {
      const numPostsToGenerate = 3; // Generate a few options
      const posts: string[] = [];

      for (let i = 0; i < numPostsToGenerate; i++) {
        const { create, schema } = ServicesMap[
          Service.LINKEDIN_POST
        ] as Features;

        const extracted = await extract({
          input: topic!,
          system: create(ctx.session.profile.me),
          schema,
        });

        console.log("Generated post content:", extracted);
        if (extracted) {
          posts.push(extracted);
          // --- Clear draft ---
          delete ctx.session.draft[Wizard.WEEKLY_IDEAS];
        }
      }

      if (posts.length === 0) {
        await ctx.reply(
          "😔 I couldn't generate any posts for that topic. Please try again with a different one."
        );
        return ctx.scene.leave();
      }

      ctx.wizard.state.data = {
        generatedPosts: posts,
        currentIndex: 0,
      };

      await displayPost(ctx);
      return ctx.wizard.next();
    } catch (error) {
      console.error("Error generating LinkedIn post:", error);
      await ctx.reply(
        "Oops, something went wrong while generating your post. Please try again later."
      );
      return ctx.scene.leave();
    }
  },

  // Step 2: Handle button presses (Confirm, Next, Edit, Cancel) or text input for edits
  async (ctx: BotContext) => {
    if (ctx.callbackQuery) {
      const data = (ctx.callbackQuery as any).data;

      switch (data) {
        case "writepost_confirm":
          const confirmedPost =
            ctx.wizard.state.data!.generatedPosts[
              ctx.wizard.state.data!.currentIndex
            ];
          await ctx.answerCbQuery();
          await ctx.telegram.editMessageText(
            ctx.session.profile.me.uid,
            ctx.wizard.state.data.messageId,
            undefined,
            `\`${confirmedPost.text}\``,
            { parse_mode: "Markdown" }
          );
          await ctx.reply(`🎉 Great! It's ready to be copied to LinkedIn!`);
          await PostManager.createPost(
            ctx.session.profile.me.uid,
            confirmedPost
          );
          return ctx.scene.leave();

        case "writepost_next":
          ctx.wizard.state.data!.currentIndex++;
          if (
            ctx.wizard.state.data!.currentIndex >=
            ctx.wizard.state.data!.generatedPosts.length
          ) {
            ctx.wizard.state.data!.currentIndex = 0; // Loop back to the first post if no more options
            await ctx.reply(
              "That's all the initial options. Looping back to the first one. Feel free to 'Edit This' or 'Generate More' later."
            );
          }
          await ctx.answerCbQuery();
          await displayPost(ctx as BotContext);
          return ctx.wizard.current; // Stay in the current step

        case "writepost_edit":
          await ctx.answerCbQuery();
          await ctx.reply(
            "✍️ Please send me your edits for the current post. I will try to incorporate them into the selected post."
          );
          return ctx.wizard.next();

        case "writepost_cancel":
          await ctx.answerCbQuery();
          await ctx.reply(
            "Okay, cancelled. You can start over with /writepost <topic>."
          );
          return ctx.scene.leave();

        case "writepost_generate_more":
          await ctx.answerCbQuery("Generating more options...");
          // This would ideally jump back to the first wizard step or a dedicated generation step
          await ctx.reply(
            "Generating more options... (Feature not fully implemented in this example, but you can re-trigger generation logic here)"
          );
          return ctx.scene.leave(); // For now, just leave

        default:
          await ctx.answerCbQuery();
          return ctx.wizard.current; // Stay in the current step
      }
    }

    // Fallback if unexpected message
    await ctx.reply("Please use the buttons or send your edits.");
    return ctx.wizard.current;
  },

  // Step 3: Handle Editing the post based on user input
  async (ctx: BotContext) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return await ctx.reply("❌ Please send text only.");
    }

    const editedText = ctx.message.text;
    const currentPost =
      ctx.wizard.state.data!.generatedPosts[
        ctx.wizard.state.data!.currentIndex
      ];

    await ctx.reply("🔄 Incorporating your edits... Please wait.");

    try {
      const { update, schema } = ServicesMap[Service.LINKEDIN_POST] as Features;

      const extracted = await extract({
        input: editedText,
        system: update(currentPost),
        schema,
      });

      if (extracted) {
        ctx.wizard.state.data!.generatedPosts[
          ctx.wizard.state.data!.currentIndex
        ] = extracted;

        console.log({ edited: ctx.wizard.state.data!.generatedPosts });

        await ctx.reply("✨ Here's the revised post:");
        await displayPost(ctx as BotContext);
      } else {
        await ctx.reply(
          "Couldn't revise the post. Please try editing again or select another option."
        );
      }
    } catch (error) {
      console.error("Error editing post:", error);
      await ctx.reply(
        "Oops, something went wrong while editing. Please try again."
      );
    }
    return ctx.wizard.back();
  }
);

export default writePostWizard;
