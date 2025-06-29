
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type Todo } from '../schema';

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const results = await db.select()
      .from(todosTable)
      .execute();

    // Convert database results to match schema types
    return results.map(todo => ({
      id: todo.id,
      description: todo.description,
      completed: todo.completed,
      created_at: todo.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    throw error;
  }
};
