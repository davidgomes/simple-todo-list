
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a test todo first
    const createResult = await db.insert(todosTable)
      .values({
        description: 'Test todo to delete',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createResult[0].id;

    // Delete the todo
    const input: DeleteTodoInput = { id: todoId };
    const result = await deleteTodo(input);

    // Should return successful deletion
    expect(result.success).toBe(true);

    // Verify todo was actually deleted from database
    const remainingTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(remainingTodos).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent todo', async () => {
    // Try to delete a todo that doesn't exist
    const input: DeleteTodoInput = { id: 999 };
    const result = await deleteTodo(input);

    // Should return unsuccessful deletion
    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting one', async () => {
    // Create multiple test todos
    const createResults = await db.insert(todosTable)
      .values([
        { description: 'First todo', completed: false },
        { description: 'Second todo', completed: true },
        { description: 'Third todo', completed: false }
      ])
      .returning()
      .execute();

    const todoToDelete = createResults[1].id;

    // Delete the middle todo
    const input: DeleteTodoInput = { id: todoToDelete };
    const result = await deleteTodo(input);

    expect(result.success).toBe(true);

    // Verify only the correct todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.map(t => t.id)).not.toContain(todoToDelete);
    expect(remainingTodos.map(t => t.description)).toEqual(['First todo', 'Third todo']);
  });
});
