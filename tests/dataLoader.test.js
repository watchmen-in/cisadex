import { loadOffices } from '../src/utils/dataLoader.js';
import { expect, test, vi } from 'vitest';

test('loadOffices returns parsed JSON', async () => {
  const mockData = [{ id: 1, name: 'Office' }];
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    })
  );

  const data = await loadOffices();
  expect(data).toEqual(mockData);
});

test('loadOffices returns empty array on fetch failure', async () => {
  global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
  const data = await loadOffices();
  expect(data).toEqual([]);
});
