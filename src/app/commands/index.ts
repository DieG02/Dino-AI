import { Composer } from "telegraf";

const composer = new Composer<any>();

composer.command("start", async (ctx: any) => {
  const profile = ctx.manager.profile;
  const username = profile.username;

  await ctx.reply(
    `👋 Welcome, *${username}*\\!\n\n` +
      `I'm here to help you stay organized with LinkedIn Account\\.\n\n`,
    { parse_mode: "MarkdownV2" }
  );
});

export default composer;
