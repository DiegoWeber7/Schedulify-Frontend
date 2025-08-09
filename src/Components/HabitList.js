import React, { useEffect, useState } from 'react';

function HabitList() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await fetch('http://localhost:4000/habits');
      const data = await res.json();
      setHabits(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
      setLoading(false);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      await fetch('http://localhost:4000/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: newHabit }),
      });
      setNewHabit('');
      fetchHabits();
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Habit Tracker</h1>

      <form onSubmit={handleAddHabit} className="flex gap-4 mb-6">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter a habit"
          className="flex-1 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading habits...</p>
      ) : habits.length === 0 ? (
        <p className="text-center text-gray-500">No habits logged yet.</p>
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="border border-gray-200 rounded-md p-3 shadow-sm flex justify-between items-center"
            >
              <span>{habit.habit}</span>
              <span className="text-sm text-gray-400">
                {new Date(habit.date).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HabitList;
