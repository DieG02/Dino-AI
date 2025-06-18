import { Context, Scenes } from "telegraf";
import { UserProfile } from "../models";

interface WizardState {
  // available in scene ctx under `ctx.wizard.state.[key]`
  profile: Partial<UserProfile>;
  currentMissingField: keyof UserProfile;
  tempData?: { [key: string]: any };
}

interface WizardSession extends Scenes.WizardSessionData {
  // available in scene ctx under `ctx.scene.session.[key]`
  key: string; // Add any custom fields you want to use in wizard.state
}

interface BotSession extends Scenes.WizardSession<WizardSession> {
  // will be available globally under `ctx.session.[key]`
  key: number;
}

export interface BotContext extends Context {
  // will be available globally under `ctx.[key]`
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext, WizardSession>;
  wizard: Scenes.WizardContextWizard<BotContext> & {
    state: WizardState;
  };
}
