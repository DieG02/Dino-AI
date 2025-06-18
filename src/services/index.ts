import { Wizard } from "../config/constants";
import extract_profile from "../lib/extract-profile";

export const context: Record<Wizard, () => string> = {
  [Wizard.SET_PROFILE]: extract_profile,
};
