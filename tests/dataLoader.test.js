import { loadOffices } from '../src/utils/dataLoader.js';
import offices from '../src/data/offices.json';
import { expect, test } from 'vitest';

test('loadOffices returns offices data', async () => {
  const data = await loadOffices();
  expect(data).toEqual(offices);
});
