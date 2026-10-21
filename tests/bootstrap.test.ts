import { test, expect } from 'vitest';
import layout from '../Tecnico/hotel_bellmare_layout_v1.json';
test('dados canônicos contêm seis áreas e portas corretas', () => {
  expect(layout.zones).toHaveLength(6);
  expect(layout.doors.map((d) => d.id)).toEqual(['301', '302', '303', 'elevador']);
});
