
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type Todo } from '../schema';

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  try {
    // Insert todo record
    const result = await db.insert(todosTable)
      .values({
        description: input.description,
        completed: false // Default value from schema
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Todo creation failed:', error);
    throw error;
  }
};
