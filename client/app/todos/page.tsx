'use client';

import { useState, useEffect } from 'react';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_BASE_URL as string);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const response = await fetch(API_BASE_URL as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: inputValue }),
      });
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const updatedTodo = await response.json();
      setTodos(
        todos.map((todo) =>
          todo._id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">To-Do List</h1>
        
        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6" role="form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </form>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No todos yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  todo.completed
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => {toggleComplete(todo._id, todo.completed); console.log('Toggled todo:', todo._id, todo.completed);}}
                    className="w-5 h-5 text-blue-500 rounded cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
