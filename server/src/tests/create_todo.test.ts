
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  description: 'Test todo item'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.description).toEqual('Test todo item');
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].description).toEqual('Test todo item');
    expect(todos[0].completed).toEqual(false);
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should create todo with correct default values', async () => {
    const result = await createTodo(testInput);

    // Verify default values are applied
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Verify created_at is recent (within last minute)
    const now = new Date();
    const createdTime = result.created_at.getTime();
    const timeDiff = now.getTime() - createdTime;
    expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
  });
});
