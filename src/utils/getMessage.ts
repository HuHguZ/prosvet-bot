import { Context, deunionize } from 'telegraf';

export const getMessageText = (message: Context['message']) => deunionize(message)?.text;
