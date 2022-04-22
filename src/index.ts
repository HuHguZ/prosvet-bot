import { Scenes, session, Telegraf } from 'telegraf';
import { telegramToken } from './config';
import { PRAYER_SCENE, prayerScene } from './scenes/prayer';
import { ChurchUserWizardContext } from './types';

const main = () => {
    const bot = new Telegraf<Scenes.WizardContext>(telegramToken);

    const stage = new Scenes.Stage<ChurchUserWizardContext>([prayerScene]);

    bot.use(session());
    bot.use(stage.middleware());

    bot.start((context) => {
        context.replyWithHTML(
            'Добро пожаловать в церковь Proсвет! В этом боте вы можете в любой момент оставить свою молитвенную нужду'
        );
    });

    bot.hears('/prayer', (ctx) => ctx.scene.enter(PRAYER_SCENE));

    bot.launch();
};

main();
