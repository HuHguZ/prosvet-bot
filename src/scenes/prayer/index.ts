import format from 'date-fns/format';
import { Composer, Markup, Scenes } from 'telegraf';
import { churchFileDB } from '../../api/fileDB';
import { dateFormat } from '../../constants';
import { getMessageText } from '../../utils/getMessage';
import { ChurchUserWizardContext } from 'src/types';

const retryComposer = new Composer<ChurchUserWizardContext>();

retryComposer.action('1', async (ctx) => {
    await ctx.answerCbQuery('Молитвенная нужда записана! Пусть Бог благословит!', {
        show_alert: true,
    });

    const todayDate = format(new Date(), dateFormat);

    await churchFileDB.updateByKeyAsync(
        'prayers',
        todayDate,
        [
            {
                name: ctx.scene.session.name,
                prayer: ctx.scene.session.prayer,
            },
        ],
        true
    );

    await ctx.reply('Используйте команду /prayer, чтобы добавить молитвенную нужду.');

    return ctx.wizard.next();
});

retryComposer.action('0', async (ctx) => {
    await ctx.answerCbQuery('Сброс...');

    return ctx.scene.enter(PRAYER_SCENE);
});

export const PRAYER_SCENE = 'PRAYER_SCENE';
export const prayerScene = new Scenes.WizardScene<ChurchUserWizardContext>(
    PRAYER_SCENE,
    async (ctx) => {
        await ctx.reply('Введите ваше имя: ');

        return ctx.wizard.next();
    },
    async (ctx) => {
        const name = getMessageText(ctx.message);

        ctx.scene.session.name = name;

        await ctx.reply('Введите вашу молитвенную нужну');

        return ctx.wizard.next();
    },
    async (ctx) => {
        const prayer = getMessageText(ctx.message);

        ctx.scene.session.prayer = prayer;

        await ctx.reply(
            'Отправить молитвенную нужду или начать всё заново?',
            Markup.inlineKeyboard([
                Markup.button.callback('Отправить', '1'),
                Markup.button.callback('Начать заново', '0'),
            ])
        );

        return ctx.wizard.next();
    },
    retryComposer
);
