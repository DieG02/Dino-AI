import { Composer, Scenes } from "telegraf";
import { Wizard } from "../../config/constants";
import setProfile from "./setprofile";

const composer = new Composer<any>();

const stage = new Scenes.Stage<any>([setProfile]);

composer.use(stage.middleware());
composer.command("setprofile", (ctx) => ctx.scene.enter(Wizard.SET_PROFILE));

export default composer;
