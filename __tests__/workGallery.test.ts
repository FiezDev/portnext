import {
  filterGalleryItems,
  toGalleryItems,
  type GalleryItem,
} from '@/lib/workGallery';

describe('workGallery', () => {
  let items: GalleryItem[];

  beforeEach(() => {
    items = toGalleryItems();
  });

  it('merges work and side projects into one gallery', () => {
    const categories = new Set(items.map((i) => i.category));
    expect(categories.has('work')).toBe(true);
    expect(categories.has('side')).toBe(true);
  });

  it('gives every item a unique id and the basics a card needs', () => {
    const ids = new Set(items.map((i) => i.id));
    expect(ids.size).toBe(items.length);
    for (const item of items) {
      expect(item.name).toBeTruthy();
      expect(Array.isArray(item.desc)).toBe(true);
      expect(Array.isArray(item.stack)).toBe(true);
      expect(Array.isArray(item.images)).toBe(true);
      expect(item.aspect).toBeGreaterThan(0);
    }
  });

  it('keeps only active work projects, newest first', () => {
    const work = items.filter((i) => i.category === 'work');
    const ids = work.map((i) => Number(i.id.replace('work-', '')));
    expect(ids).toEqual([...ids].sort((a, b) => b - a));
  });

  it('filters by category and passes everything through on "all"', () => {
    const work = filterGalleryItems(items, 'work');
    const side = filterGalleryItems(items, 'side');
    const all = filterGalleryItems(items, 'all');

    expect(work.every((i) => i.category === 'work')).toBe(true);
    expect(side.every((i) => i.category === 'side')).toBe(true);
    expect(work.length + side.length).toBe(all.length);
    expect(all).toEqual(items);
  });
});
