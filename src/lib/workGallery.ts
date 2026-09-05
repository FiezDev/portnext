import { SideProjects, WorkProjects } from '@/mocks/projectMock';
import { resolveImageSrc } from '@/lib/utils';
import type { SideProjectObj, WorkProjectObj } from '@/types/object';

export type GalleryCategory = 'work' | 'side';
export type GalleryFilter = 'all' | GalleryCategory;

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  name: string;
  intro?: string;
  desc: string[];
  stack: string[];
  /** All screenshots, resolved; card shows [0], modal can cycle the rest. */
  images: string[];
  /** width / height of the first screenshot, for a masonry-natural aspect. */
  aspect: number;
  status?: string;
  caseStudyHref?: string;
  ghlink?: string;
  weblink?: string;
  apilink?: string;
};

const FALLBACK_ASPECT = 16 / 10;

const workToItem = (p: WorkProjectObj): GalleryItem => {
  const picurl = p.projectPic?.picurl;
  const images = (picurl?.pic || []).map(resolveImageSrc);
  const aspect =
    picurl && picurl.height > 0
      ? picurl.width / picurl.height
      : FALLBACK_ASPECT;

  return {
    id: `work-${p.projectID}`,
    category: 'work',
    name: p.projectName,
    intro: p.projectIntro,
    desc: p.projectDesc,
    stack: p.stack,
    images,
    aspect,
    status: p.status,
    caseStudyHref: `/work/${p.projectID}`,
  };
};

const sideToItem = (p: SideProjectObj, index: number): GalleryItem => ({
  id: `side-${index}-${p.projectName}`,
  category: 'side',
  name: p.projectName,
  intro: p.projectIntro,
  desc: p.projectDesc,
  stack: p.stack,
  images: (p.pic || []).map(resolveImageSrc),
  aspect: FALLBACK_ASPECT,
  ghlink: p.ghlink || undefined,
  weblink: p.weblink || undefined,
  apilink: p.apilink || undefined,
});

/** Work cards first (newest projectID first), then side projects in mock order. */
export const toGalleryItems = (): GalleryItem[] => [
  ...[...WorkProjects]
    .filter((p) => p.activeFlag !== false)
    .sort((a, b) => b.projectID - a.projectID)
    .map(workToItem),
  ...SideProjects.map(sideToItem),
];

export const filterGalleryItems = (
  items: GalleryItem[],
  filter: GalleryFilter
): GalleryItem[] =>
  filter === 'all' ? items : items.filter((i) => i.category === filter);
