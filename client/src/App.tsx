
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load todos with proper dependency handling
  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoDescription.trim()) return;

    setIsCreating(true);
    try {
      const todoData: CreateTodoInput = {
        description: newTodoDescription.trim()
      };
      
      const newTodo = await trpc.createTodo.mutate(todoData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoDescription('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    setIsLoading(true);
    try {
      const updatedTodo = await trpc.updateTodo.mutate({
        id: todo.id,
        completed: !todo.completed
      });
      
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteTodo.mutate({ id: todoId });
      setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✅ Todo List</h1>
          <p className="text-gray-600">Stay organized and get things done!</p>
        </div>

        {/* Add New Todo Form */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-2">
              <Input
                placeholder="What needs to be done? 🎯"
                value={newTodoDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTodoDescription(e.target.value)
                }
                className="flex-1"
                disabled={isCreating}
              />
              <Button 
                type="submit" 
                disabled={isCreating || !newTodoDescription.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isCreating ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        {totalCount > 0 && (
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">📊</div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Progress: {completedCount} of {totalCount} completed
                    </p>
                    <div className="w-64 h-3 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Badge variant={completedCount === totalCount && totalCount > 0 ? "default" : "secondary"}>
                  {completedCount === totalCount && totalCount > 0 ? "🎉 All Done!" : `${Math.round((completedCount / totalCount) * 100)}%`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Todo List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Your Todos
              <Badge variant="outline">{totalCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-500 text-lg">No todos yet!</p>
                <p className="text-gray-400">Add your first todo above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo: Todo, index: number) => (
                  <div key={todo.id}>
                    <div className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                      todo.completed 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}>
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        disabled={isLoading}
                        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400 hover:text-indigo-600" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-lg ${
                          todo.completed 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-800'
                        }`}>
                          {todo.description}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Created: {todo.created_at.toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {todo.completed && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✅ Done
                          </Badge>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{todo.description}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {index < todos.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>💡 Click the circle to mark todos as complete</p>
        </div>
      </div>
    </div>
  );
}

export default App;
