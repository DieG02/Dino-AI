import dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import { BotContext } from "./models/telegraf";

import { setupBotApp } from "./app";

// --- Environment Variables ---
const RELEASE = process.env.MODE;
const PORT = process.env.PORT;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// --- Initialize Bot Instance ---
if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN environment variable is not set!");
  process.exit(1);
}
export const main = new Telegraf<BotContext>(TOKEN);

// --- Setup Bot Application Logic ---
setupBotApp(main);

// --- Bot Startup ---
(async () => {
  console.log("Bot starting...");

  if (RELEASE === "PRODUCTION") {
    // --- PRODUCTION MODE (WEBHOOKS) ---
    if (!WEBHOOK_URL) {
      console.error(
        "WEBHOOK_URL environment variable is not set in production mode!"
      );
      process.exit(1);
    }
    const webhookPort = PORT ? parseInt(PORT) : 8080;

    try {
      await main.launch({
        webhook: {
          domain: WEBHOOK_URL,
          port: webhookPort,
        },
      });
      console.log(`🚀 Webhook server listening on port ${webhookPort}`);
      console.log(`Telegram webhook set to: ${WEBHOOK_URL}`);
      console.log("🤖 Bot is running in Webhook Mode.");
    } catch (error) {
      console.error("Error starting bot in webhook mode:", error);
      process.exit(1);
    }
  } else {
    // --- DEVELOPMENT MODE (LONG POLLING) ---
    try {
      await main.launch();
      console.log("🤖 Bot is running with long polling (development mode)");
      console.log("Send /start to your bot in Telegram to test it.");
    } catch (error) {
      console.error("Error starting bot in long polling mode:", error);
      process.exit(1);
    }
  }
})();

// --- Graceful Shutdown ---
const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down...`);
  await main.stop(signal); // Ensure bot stops gracefully
  process.exit(0);
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
