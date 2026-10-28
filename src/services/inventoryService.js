import cars from '../data/cars.json';
// The UI uses this contract. Replace implementations with fetch('/api/cars') later.
export const inventoryService = {
 async list() { return structuredClone(cars); },
 async get(id) { return structuredClone(cars.find(car => car.id === id) ?? null); }
};
