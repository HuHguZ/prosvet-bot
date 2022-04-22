import { Scenes } from 'telegraf';
import { WizardSessionData } from 'telegraf/typings/scenes';

interface ChurchUserSession extends WizardSessionData {
    name?: string;
    prayer?: string;
}

export type ChurchUserWizardContext = Scenes.WizardContext<ChurchUserSession>;
