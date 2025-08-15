import { useSearchParams } from 'react-router-dom';
import { Filters } from '../constants/taxonomy';

export interface UrlState {
  z?: number;
  c?: [number, number];
  b?: [number, number, number, number];
  f?: Filters;
  s?: string;
  cmp?: string[];
  threatFilter?: {
    types?: string[];
    severity?: string[];
    timeRange?: string;
  };
}

export default function useUrlState(): [UrlState, (s: Partial<UrlState>) => void] {
  const [params, setParams] = useSearchParams();

  const state: UrlState = {};
  const z = params.get('z');
  if (z) state.z = Number(z);
  const c = params.get('c');
  if (c) state.c = c.split(',').map(Number) as any;
  const b = params.get('b');
  if (b) state.b = b.split(',').map(Number) as any;
  const f = params.get('f');
  if (f) {
    try {
      state.f = JSON.parse(f);
    } catch {}
  }
  const s = params.get('s');
  if (s) state.s = s;
  const cmp = params.get('cmp');
  if (cmp) state.cmp = cmp.split(',');
  const tf = params.get('tf');
  if (tf) {
    try {
      state.threatFilter = JSON.parse(tf);
    } catch {}
  }

  const update = (patch: Partial<UrlState>) => {
    const next = new URLSearchParams(params);
    if (patch.z !== undefined) next.set('z', String(patch.z));
    if (patch.c) next.set('c', patch.c.join(','));
    if (patch.b) next.set('b', patch.b.join(','));
    if (patch.f) next.set('f', JSON.stringify(patch.f));
    if (patch.s !== undefined) next.set('s', patch.s);
    if (patch.cmp) next.set('cmp', patch.cmp.join(','));
    if (patch.threatFilter) next.set('tf', JSON.stringify(patch.threatFilter));
    
    // Remove empty parameters
    for (const [key, value] of next.entries()) {
      if (!value || value === '{}' || value === '[]') {
        next.delete(key);
      }
    }
    
    setParams(next, { replace: true });
  };

  return [state, update];
}
