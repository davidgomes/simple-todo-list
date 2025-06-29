
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo completion status to true', async () => {
    // Create a test todo first
    const insertResult = await db.insert(todosTable)
      .values({
        description: 'Test todo',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    // Update the todo to completed
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    const result = await updateTodo(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTodo.id);
    expect(result.description).toEqual('Test todo');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at).toEqual(createdTodo.created_at);
  });

  it('should update todo completion status to false', async () => {
    // Create a test todo that is already completed
    const insertResult = await db.insert(todosTable)
      .values({
        description: 'Completed todo',
        completed: true
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    // Update the todo to not completed
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: false
    };

    const result = await updateTodo(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTodo.id);
    expect(result.description).toEqual('Completed todo');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated todo to database', async () => {
    // Create a test todo
    const insertResult = await db.insert(todosTable)
      .values({
        description: 'Database test todo',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    // Update the todo
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    await updateTodo(updateInput);

    // Query the database to verify the update was persisted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].id).toEqual(createdTodo.id);
    expect(todos[0].description).toEqual('Database test todo');
    expect(todos[0].completed).toEqual(true);
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when todo does not exist', async () => {
    const updateInput: UpdateTodoInput = {
      id: 999, // Non-existent ID
      completed: true
    };

    await expect(updateTodo(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve original description and created_at when updating', async () => {
    // Create a test todo with specific values
    const originalDescription = 'Original description';
    const insertResult = await db.insert(todosTable)
      .values({
        description: originalDescription,
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];
    const originalCreatedAt = createdTodo.created_at;

    // Update only the completion status
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    const result = await updateTodo(updateInput);

    // Verify that description and created_at are preserved
    expect(result.description).toEqual(originalDescription);
    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.completed).toEqual(true);
  });
});
