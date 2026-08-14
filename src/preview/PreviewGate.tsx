import type { ReactNode } from 'react';
import { WarmWindowPreview } from '../components/preview/WarmWindowPreview';
import { isWarmWindowPreview } from './warmWindowMode';

interface PreviewGateProps {
  search: string;
  children: ReactNode;
}

export function PreviewGate({ search, children }: PreviewGateProps) {
  if (isWarmWindowPreview(search)) {
    return <WarmWindowPreview />;
  }

  return children;
}
