import type { i18n } from 'i18next';
import { useTranslation } from 'react-i18next';

type Values = Record<string, string | number>;
export type LandingText = (source: string, values?: Values) => string;

/** Source English is the message ID; names, event data and links stay canonical. */
export function landingText(i18n: i18n, source: string, values?: Values): string {
  return i18n.t(source, {
    ...values,
    ns: 'landing',
    keySeparator: false,
    nsSeparator: false,
    defaultValue: source,
  });
}

export function useLandingText(): LandingText {
  const { i18n } = useTranslation('landing');
  return (source, values) => landingText(i18n, source, values);
}
