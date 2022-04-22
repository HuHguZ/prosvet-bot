import fs from 'fs';
import path from 'path';
import format from 'date-fns/format';
import { Workbook } from 'exceljs';
import { Composer, Markup, Scenes } from 'telegraf';
import { PRAY_DIRECTORY } from '../../constants';
import { getMessageText } from '../../utils/getMessage';
import { ChurchUserWizardContext } from 'src/types';

const todayDate = format(new Date(), 'dd.MM.yyyy');
const exelFilePath = path.join(PRAY_DIRECTORY, `${todayDate}.csv`);

if (!fs.existsSync(exelFilePath)) {
    const workbook = new Workbook();

    const sheet = workbook.addWorksheet();

    sheet.columns = [
        {
            header: 'Имя',
            key: 'name',
        },
        {
            header: 'Нужда',
            key: 'prayer',
        },
    ];

    sheet.addRow({
        name: 'Илья',
        prayer: 'За здоровье семьи',
    });

    workbook.csv.writeFile(exelFilePath, {
        formatterOptions: {
            writeBOM: true,
        },
        encoding: 'utf-8',
    });
} else {
    (async () => {
        // const workbook = new stream.xlsx.WorkbookWriter({
        //     filename: exelFilePath,
        //     useSharedStrings: true,
        //     useStyles: true,
        // });

        const workbook = new Workbook();

        await workbook.csv.readFile(exelFilePath);

        const sheet = workbook.getWorksheet(1);

        sheet.getCell(1, 11).value = Math.random();

        for (let i = 0; i < 10; i++) {
            sheet
                .addRow({
                    name: 'Имя',
                    prayer: 'Тест',
                })
                .commit();
        }

        await workbook.csv.writeFile(exelFilePath, {
            formatterOptions: {
                writeBOM: true,
            },
            encoding: 'utf-8',
        });
    })();
}

const retryComposer = new Composer<ChurchUserWizardContext>();

retryComposer.action('1', async (ctx) => {
    await ctx.answerCbQuery('Молитвенная нужда записана! Пусть Бог благословит!', {
        show_alert: true,
    });

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
