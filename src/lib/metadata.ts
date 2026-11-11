export const SITE_URL = 'https://nuopen.nuacm.kz';
export const SITE_TITLE = 'NU Open 2026';
export const SITE_DESCRIPTION =
  'November 22 at Nazarbayev University, Astana. Teams of 1 to 3 compete in a five-hour ICPC-style programming contest for a ₸1,000,000 prize pool.';
export const FAQ_TITLE = 'All questions about NU Open';

/** Keep search results and social previews consistent when a page overrides its copy. */
export function pageMetadata(title: string, description: string) {
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];
}
