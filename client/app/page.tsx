'use client';

import { useState, useEffect } from 'react';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/todos'
  : '/api/todos';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTodos();
    console.log(API_BASE_URL)
    console.log(process.env.NODE_ENV)
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_BASE_URL as string);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 flex items-center justify-center">
      
      {/* Main Card Container with Glassmorphism effect */}
      <div className="w-full max-w-lg bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-8 text-white">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">
            My Tasks
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Stay organized, get things done.
          </p>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="flex gap-3 mb-8" role="form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:bg-green-500/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-50"
            disabled={!inputValue.trim()}
          >
            Add a Task
          </button>
        </form>

        {/* Todo List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
             <div className="text-center py-8 text-white/70">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
               Loading tasks...
             </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/20">
              <p className="text-white/60">Your list is empty.</p>
              <p className="text-white/40 text-sm mt-1">Add a task to get started!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.02] ${
                  todo.completed
                    ? 'bg-white/10 border-transparent'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleComplete(todo._id, todo.completed)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Custom Checkbox */}
                  <div 
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors duration-300 ${
                      todo.completed 
                        ? 'bg-white border-white' 
                        : 'border-white/40 group-hover:border-white'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Todo Text */}
                  <span
                    className={`flex-1 truncate transition-all duration-300 ${
                      todo.completed 
                        ? 'text-white/50 line-through' 
                        : 'text-white font-medium'
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the toggle on the parent div
                    deleteTodo(todo._id);
                  }}
                  className="ml-4 p-2 text-white/40 hover:text-red-300 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none"
                  aria-label="Delete Todo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}