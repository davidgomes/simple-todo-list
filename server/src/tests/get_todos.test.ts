
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it('should return all todos from database', async () => {
    // Create test todos
    await db.insert(todosTable)
      .values([
        { description: 'First todo', completed: false },
        { description: 'Second todo', completed: true },
        { description: 'Third todo', completed: false }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    expect(result[0].description).toEqual('First todo');
    expect(result[0].completed).toBe(false);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].description).toEqual('Second todo');
    expect(result[1].completed).toBe(true);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);

    expect(result[2].description).toEqual('Third todo');
    expect(result[2].completed).toBe(false);
    expect(result[2].id).toBeDefined();
    expect(result[2].created_at).toBeInstanceOf(Date);
  });

  it('should return todos with correct field types', async () => {
    await db.insert(todosTable)
      .values({ description: 'Test todo', completed: true })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('number');
    expect(typeof result[0].description).toBe('string');
    expect(typeof result[0].completed).toBe('boolean');
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});
