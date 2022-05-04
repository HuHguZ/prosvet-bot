import { Scenes } from 'telegraf';
import { WizardSessionData } from 'telegraf/typings/scenes';

export interface Pray {
    name?: string;
    prayer?: string;
}

interface ChurchUserSession extends WizardSessionData {
    name: Pray['name'];
    prayer: Pray['prayer'];
}

export type ChurchUserWizardContext = Scenes.WizardContext<ChurchUserSession>;
