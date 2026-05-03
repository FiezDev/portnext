export type PageId = 'Main' | 'About' | 'Skill' | 'Projects' | 'Contact';

export const PAGE_ORDER: PageId[] = ['Main', 'About', 'Skill', 'Projects', 'Contact'];

export const isValidPage = (page: string): page is PageId => PAGE_ORDER.includes(page as PageId);

export const getAdjacentPage = (currentPage: PageId, direction: 'next' | 'prev'): PageId | null => {
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  if (currentIndex === -1) return null;

  const nextIndex = direction === 'next'
    ? Math.min(currentIndex + 1, PAGE_ORDER.length - 1)
    : Math.max(currentIndex - 1, 0);

  return PAGE_ORDER[nextIndex];
};
