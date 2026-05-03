'use client';

import type { PageId } from '../shared/useComplexTransition';

interface StageProps {
  currentPage: PageId;
  previousPage?: PageId;
}

// Phase 1 stub. Real Canvas mounts in Phase 2.
const Stage = ({ currentPage }: StageProps) => {
  void currentPage;
  return null;
};

export default Stage;
