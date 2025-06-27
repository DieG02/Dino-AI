import { Context, Scenes } from "telegraf";
import { UserProfile } from "../models";
import { Wizard } from "../config/constants";

export interface WizardState {
  // available in scene ctx under `ctx.wizard.state.[key]`
  profile: Partial<UserProfile>;
  currentMissingField: keyof UserProfile;
  data: { [key: string]: any };
}

export interface WizardSession extends Scenes.WizardSessionData {
  // available in scene ctx under `ctx.scene.session.[key]`
  key: string; // Add any custom fields you want to use in wizard.state
}

export interface BotSession extends Scenes.WizardSession<WizardSession> {
  // will be available globally under `ctx.session.[key]`
  profile: UserProfile;
  draft: Partial<Record<Wizard, any>>;
}

export interface BotContext extends Context {
  // will be available globally under `ctx.[key]`
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext, WizardSession>;
  wizard: Scenes.WizardContextWizard<BotContext> & {
    state: WizardState;
    current: number;
  };
}
