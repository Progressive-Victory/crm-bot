import English from './English';

const Languages = { English };

export const SupportedLanguages = ['English'] as const;

export const localeToLanguage = { 'en-US': 'English' } as const;

export type SupportedLanguage = (typeof SupportedLanguages)[number];

export const DefaultLanguage = 'English';

export default Languages;
