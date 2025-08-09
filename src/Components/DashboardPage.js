import React, { useState, useEffect } from 'react';
import Tabs from './Tabs';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Helper to get color based on progress %
function getProgressColor(percent) {
  if (percent === 100) return '#10B981'; // green
  if (percent > 60) return '#3B82F6'; // blue
  if (percent > 30) return '#FBBF24'; // amber
  return '#EF4444'; // red
}

// Priority badge component
function PriorityBadge({ priority }) {
  const colors = {
    High: 'bg-red-600 text-white',
    Medium: 'bg-yellow-500 text-black',
    Low: 'bg-green-500 text-white',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[priority] || 'bg-gray-400 text-black'}`}
    >
      {priority}
    </span>
  );
}

export default function Dashboard() {
  // --- Feedback state for AI schedule ---
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiFeedbackSubmitted, setAiFeedbackSubmitted] = useState(false);

  // Send feedback to backend
  async function sendFeedback() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await fetch('http://localhost:4000/api/schedule-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: aiSchedule,
          feedback: aiFeedback,
          date: new Date().toISOString(),
          userId: user?.id || null,
        })
      });
      setAiFeedback('');
      setAiFeedbackSubmitted(true);
    } catch (err) {
      console.error('Error sending feedback:', err);
    }
  }
  // --- Manual tasks for AI Planner tab ---
  const [aiManualTasks, setAiManualTasks] = useState([]);
  const [manualTaskName, setManualTaskName] = useState('');
  const [manualTaskTime, setManualTaskTime] = useState('');
  async function saveManualTaskToBackend(taskName, taskTime) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No logged-in user');
    const response = await fetch('http://localhost:4000/api/manual-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        name: taskName,
        time: taskTime || '',
      }),
    });
    if (!response.ok) throw new Error('Failed to save manual task');
    const result = await response.json();
    console.log('Manual task saved:', result);
  } catch (error) {
    console.error('Error saving manual task:', error);
  }
}

  async function addManualTask() {
    if (!manualTaskName) return;
    setAiManualTasks([...aiManualTasks, { name: manualTaskName, time: manualTaskTime }]);
    await saveManualTaskToBackend(manualTaskName, manualTaskTime);
    setManualTaskName('');
    setManualTaskTime('');
  }
  function removeManualTask(idx) {
    setAiManualTasks(aiManualTasks.filter((_, i) => i !== idx));
  }

  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
const [aiTasks, setAiTasks] = useState([]); // Separate AI-generated tasks
const [aiSchedule, setAiSchedule] = useState('');
const [aiLoading, setAiLoading] = useState(false);
// Example user answers state, fill these from your questions popup
const [userAnswers, setUserAnswers] = useState({
  work: 'Yes',
  school: 'No',
  startTime: '07:00',
  sleepTime: '23:00',
  hoursPerDay: 8,
  commitments: 'Meetings every Tuesday',
  recurringEvents: [
    { description: 'Dance class', schedule: 'Thursday 6-7pm' },
  ],
});

async function generateAISchedule() {
  setAiLoading(true);
  setAiError('');
  try {
    const { data: { user } } = await supabase.auth.getUser(); // Get logged-in user here
    if (!user) throw new Error('User not logged in');

    const response = await fetch('http://localhost:4000/api/generate-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,    // Pass userId here
        work: aiAnswers.work,
        school: aiAnswers.school,
        startTime: aiAnswers.startTime,
        sleepTime: aiAnswers.sleepTime,
        hoursPerDay: aiAnswers.hoursPerDay,
        commitments: aiAnswers.commitments,
        recurringEvents: aiAnswers.recurringEvents || [],
      }),
    });

    if (!response.ok) throw new Error('Failed to generate schedule');

    const data = await response.json();
    setAiSchedule(data.schedule);
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    setAiError('Failed to generate schedule. Please try again.');
  } finally {
    setAiLoading(false);
  }
}

const [aiError, setAiError] = useState('');


  useEffect(() => {
    const fetchTasks = async () => {
      // Get the logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);
        if (error) {
          console.error('Error fetching tasks:', error);
        } else {
          setTasks(tasks);
        }
      }
    };
    fetchTasks();
  }, []);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [showTasksDropdown, setShowTasksDropdown] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState(0);

  // AI Planner Questions Modal State
  const [showAiQuestions, setShowAiQuestions] = useState(false);
  const [aiAnswers, setAiAnswers] = useState({
    work: '',
    school: '',
    startTime: '',
    sleepTime: '',
    hoursPerDay: '',
    commitments: '',
  });
  // Show modal when AI Planner tab is selected (one-time only)
  useEffect(() => {
    if (activeTab === 1) {
      const completed = localStorage.getItem('aiOnboardingComplete');
      if (!completed) {
        setShowAiQuestions(true);
      }
    }
  }, [activeTab]);

  // Onboarding completion handler
  function handleAiOnboardingComplete() {
    setShowAiQuestions(false);
    localStorage.setItem('aiOnboardingComplete', 'true');
  }

  // Handle modal close (Escape or click outside)
  useEffect(() => {
    if (!showAiQuestions) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setShowAiQuestions(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAiQuestions]);

  const [editStartTime, setEditStartTime] = useState('');
  const [editDurationMinutes, setEditDurationMinutes] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Progress and streak calculation
  const doneCount = tasks.filter(t => t.done).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  // Dummy streaks, replace with your real logic
  const currentStreak = 3;
  const longestStreak = 7;

  // Motivation text
  const motivation =
    progressPercent === 100
      ? "You're killing it! Keep this streak alive!"
      : progressPercent > 60
      ? "Almost there, keep going!"
      : "Let's smash some tasks today!";

  // Rotating encouragement messages
  const encouragementMessages = [
    "You’re unstoppable today! 🚀",
    "Every small step counts. Keep going! 💪",
    "Consistency is your superpower! ✨",
    "You’re building habits for a lifetime! 🌱",
    "Progress, not perfection. One task at a time! ✅",
    "Today is a great day to win! 🏆",
    "You’re closer than you think. Don’t stop now! 🔥",
    "Great things are done by a series of small things brought together."
  ];
  const [encouragementMessage, setEncouragementMessage] = useState(encouragementMessages[0]);

  useEffect(() => {
    // Rotate message daily based on date
    const dayIndex = new Date().getDate() % encouragementMessages.length;
    setEncouragementMessage(encouragementMessages[dayIndex]);
  }, []);

  // Resize listener for confetti
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Task operations
  function toggleTask(id) {
    setTasks(tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }
  function addTask() {
    if (!newTaskText.trim()) return;
    const totalMinutes = (parseInt(newTaskHours) || 0) * 60 + (parseInt(newTaskMinutes) || 0);
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: newTaskText,
        done: false,
        priority: 'Medium',
        startTime: '',
        durationMinutes: totalMinutes,
      },
    ]);
    setNewTaskText('');
    setNewTaskHours('');
    setNewTaskMinutes('');
  }
  function removeTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }
  function openEditModal(task) {
    setSelectedTask(task);
    setEditName(task.text);
    setEditPriority(task.priority);
    setEditStartTime(task.startTime || '');
    setEditDurationMinutes(task.durationMinutes || 0);
  }
  function closeEditModal() {
    setSelectedTask(null);
  }
  function saveTaskEdits() {
    setTasks(tasks.map(t => (t.id === selectedTask.id ? {
      ...t,
      text: editName,
      priority: editPriority,
      startTime: editStartTime,
      durationMinutes: editDurationMinutes,
    } : t)));
    closeEditModal();
  }

  // Format time range
  function formatTimeRange(startTime, duration) {
    if (!startTime || !duration) return null;
    const [hour, minute] = startTime.split(':').map(Number);
    let endMinute = minute + duration;
    let endHour = hour + Math.floor(endMinute / 60);
    endMinute = endMinute % 60;
    endHour = endHour % 24;
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(hour)}:${pad(minute)} - ${pad(endHour)}:${pad(endMinute)}`;
  }

  // Logout handler (replace with your auth logic)
  function handleLogout() {
    // Example: supabase.auth.signOut() or localStorage clear
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E2A47] text-white font-sans p-6">
      {/* Header with task count bubble and color mode toggle */}
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-8 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-extrabold select-none">
            Sched
            <span className="text-[#3B82F6]">ulify</span>
          </div>
          {/* Task Count Bubble */}
          <div className="relative">
            <button
              className="ml-2 text-lg font-semibold flex items-center gap-2 focus:outline-none select-none hover:text-[#3B82F6] transition"
              onClick={() => setShowTasksDropdown((v) => !v)}
              aria-expanded={showTasksDropdown}
            >
              Your Tasks for Today
              <svg className={`w-5 h-5 transition-transform ${showTasksDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <span className="absolute -top-2 -right-6 bg-[#3B82F6] text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg">
              {tasks.length}
            </span>
            {/* Dropdown for tasks */}
            <motion.div
              initial={false}
              animate={{ height: showTasksDropdown ? 'auto' : 0, opacity: showTasksDropdown ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 mt-2 w-64 bg-[#1e293b] bg-opacity-90 backdrop-blur rounded-xl shadow-xl z-20 overflow-hidden border border-white/10"
              style={{ pointerEvents: showTasksDropdown ? 'auto' : 'none' }}
            >
              <ul className="divide-y divide-white/10">
                {tasks.length === 0 ? (
                  <li className="py-4 px-6 text-gray-400 text-center">No tasks for today!</li>
                ) : (
                  tasks.map((task, i) => (
                    <li key={task.id} className="py-3 px-6 flex justify-between items-center text-sm">
                      <span>{task.text}</span>
                      <span className="ml-4 text-xs text-gray-400">
                        {task.durationMinutes ? `${Math.floor(task.durationMinutes/60)}h ${task.durationMinutes%60}m` : '--'}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Color Mode Toggle Placeholder */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition border border-white/20 backdrop-blur"
            title="Toggle color mode"
          >
            {/* Sun/Moon Icon placeholder (Heroicons) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M21 12h-1.5M4.5 12H3M18.72 5.28l-1.06 1.06M5.28 18.72l-1.06 1.06M12 7.5a4.5 4.5 0 104.5 4.5A4.5 4.5 0 0012 7.5z" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#10B981] hover:bg-[#0e946d] transition px-4 py-2 rounded-full font-semibold text-black shadow-[0_0_12px_#10B981]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Daily Encouragement Message */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-lg md:text-xl text-gray-300 font-light mb-1">{encouragementMessage}</p>
        <p className="text-base text-gray-400">Let's smash some tasks today!</p>
      </div>

      {/* Main Dashboard Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-8"

      >
        {/* Progress Circle */}
        <div className="bg-[#121B2E] rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Overall Completion</h3>
          <div style={{ width: 140, height: 140, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <CircularProgressbar
    value={progressPercent}
    text={''} // Remove default text
    styles={buildStyles({
      textSize: '24px',
      pathColor: getProgressColor(progressPercent),
      textColor: getProgressColor(progressPercent),
      trailColor: '#334155',
      fontWeight: '700',
    })}
  />
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 28,
    color: getProgressColor(progressPercent),
    pointerEvents: 'none',
    userSelect: 'none',
  }}>
    {progressPercent}%
  </div>
</div>
          {progressPercent === 100 && (
            <>
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={500}
                recycle={false}
              />
              <motion.div
                animate={{ y: [-5, 0, -5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-2 text-green-400 font-bold text-sm select-none"
              >
              You did it!
              </motion.div>
            </>
          )}
          <p className="mt-4 text-center text-gray-300">{motivation}</p>
        </div>

        {/* Streak Tracker */}
        <div className="bg-[#121B2E] rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-4">Current Streak</h3>
          <p className="text-6xl font-bold text-[#10B981] select-none">{currentStreak}</p>
          <p className="text-gray-400 mb-6 select-none">
            {currentStreak === 1 ? 'day in a row' : 'days in a row'}
          </p>
          <h4 className="text-lg font-semibold mb-2">Longest Streak</h4>
          <p className="text-4xl font-bold text-[#3B82F6] select-none">{longestStreak}</p>
        </div>

        {/* Stats Cards */}
        <div className="bg-[#121B2E] rounded-xl shadow-lg p-6 flex flex-col space-y-4">
          <div className="p-4 bg-[#3B82F6] text-black rounded-lg shadow-md">
            <h4 className="text-lg font-semibold">Total Habits Tracked</h4>
            <p className="text-3xl font-bold select-none">{tasks.length}</p>
          </div>
          <div className="p-4 bg-[#10B981] text-black rounded-lg shadow-md">
            <h4 className="text-lg font-semibold">Tasks Completed Today</h4>
            <p className="text-3xl font-bold select-none">{doneCount} / {tasks.length}</p>
          </div>
          <div className="p-4 bg-[#3B82F6] text-black rounded-lg shadow-md">
            <h4 className="text-lg font-semibold">Current Streak</h4>
            <p className="text-3xl font-bold select-none">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs for Manual and AI Planner */}
      <div className="max-w-5xl mx-auto mt-12 bg-[#121B2E] rounded-xl shadow-lg p-6">
        {/* AI Questions Modal */}
        {showAiQuestions && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            aria-modal="true"
            role="dialog"
            tabIndex="-1"
            onClick={e => {
              if (e.target === e.currentTarget) setShowAiQuestions(false);
            }}
          >
            <form
              className="bg-[#121B2E] rounded-xl shadow-lg p-8 w-[95vw] max-w-md text-white flex flex-col gap-4"
              onSubmit={e => {
                e.preventDefault();
                handleAiOnboardingComplete();
              }}
              tabIndex={0}
              aria-label="Answer AI Planner Questions"
            >
              <h2 className="text-xl font-bold mb-2">Help us personalize your plan</h2>
              <label className="flex flex-col gap-1">
                1. Do you work?
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="work" value="Yes" checked={aiAnswers.work==='Yes'} onChange={()=>setAiAnswers(a=>({...a,work:'Yes'}))} required /> Yes
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="work" value="No" checked={aiAnswers.work==='No'} onChange={()=>setAiAnswers(a=>({...a,work:'No'}))} /> No
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-1">
                2. Are you in school?
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="school" value="Yes" checked={aiAnswers.school==='Yes'} onChange={()=>setAiAnswers(a=>({...a,school:'Yes'}))} required /> Yes
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="school" value="No" checked={aiAnswers.school==='No'} onChange={()=>setAiAnswers(a=>({...a,school:'No'}))} /> No
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-1">
                3. What time do you usually start your day?
                <input type="time" required value={aiAnswers.startTime} onChange={e=>setAiAnswers(a=>({...a,startTime:e.target.value}))} className="rounded bg-[#16213E] border border-[#3B82F6] px-2 py-1 text-white" />
              </label>
              <label className="flex flex-col gap-1">
                4. What time do you usually go to sleep?
                <input type="time" required value={aiAnswers.sleepTime} onChange={e=>setAiAnswers(a=>({...a,sleepTime:e.target.value}))} className="rounded bg-[#16213E] border border-[#3B82F6] px-2 py-1 text-white" />
              </label>
              <label className="flex flex-col gap-1">
                5. How many hours per day can you dedicate to your tasks?
                <input type="number" min="1" max="24" required value={aiAnswers.hoursPerDay} onChange={e=>setAiAnswers(a=>({...a,hoursPerDay:e.target.value}))} className="rounded bg-[#16213E] border border-[#3B82F6] px-2 py-1 text-white" />
              </label>

              <label className="flex flex-col gap-1">
                5. Do you have any fixed commitments (e.g., meetings, classes)?
                <textarea rows={2} value={aiAnswers.commitments} onChange={e=>setAiAnswers(a=>({...a,commitments:e.target.value}))} className="rounded bg-[#16213E] border border-[#3B82F6] px-2 py-1 text-white" placeholder="Describe briefly..." />
              </label>
              <button type="submit" className="mt-2 bg-[#3B82F6] hover:bg-[#2563EB] transition rounded-full py-2 px-6 font-bold text-black shadow-[0_0_10px_#3B82F6] focus:outline-none">
                Continue
              </button>
            </form>
          </div>
        )}

        <Tabs
          tabs={[
            {
              label: 'Manual',
              content: (
                <>
                  <h2 className="text-2xl font-semibold mb-6">Your Tasks for Today</h2>
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-6 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 text-[#3B82F6]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-xl font-semibold">No tasks yet</p>
                      <p className="max-w-xs text-center">
                        Start by adding your first task to get things moving!
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {tasks.map(({ id, text, done, priority, startTime, durationMinutes }) => (
                        <li
                          key={id}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-[#1e293b]"
                        >
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={e => {
                                e.stopPropagation();
                                toggleTask(id);
                              }}
                              className="w-6 h-6 cursor-pointer rounded border-gray-500 text-[#10B981]"
                            />
                            <div
                              className="flex flex-col cursor-pointer"
                              onClick={() => openEditModal({ id, text, done, priority, startTime, durationMinutes })}
                            >
                              <PriorityBadge priority={priority} />
                              <span className={done ? 'line-through text-gray-400' : 'text-white'}>
                                {text}
                              </span>
                              {startTime && durationMinutes ? (
                                <span className="text-[#3B82F6] font-semibold text-sm">
                                  {formatTimeRange(startTime, durationMinutes)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              removeTask(id);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-2xl"
                            aria-label={`Remove task ${text}`}
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Add Task Form */}
                  <div className="mt-8 flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
                    <input
                      type="text"
                      placeholder="New task"
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      className="flex-grow rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                    <input
                      type="number"
                      placeholder="Hours"
                      value={newTaskHours}
                      onChange={e => setNewTaskHours(e.target.value)}
                      className="w-24 rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Minutes"
                      value={newTaskMinutes}
                      onChange={e => setNewTaskMinutes(e.target.value)}
                      className="w-24 rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      min="0"
                      max="59"
                    />
                    <button
                      onClick={addTask}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] transition rounded-full py-3 px-8 font-bold text-black shadow-[0_0_15px_#3B82F6]"
                    >
                      Add Task
                    </button>
                  </div>
                </>
              )
            },
            {
              label: 'AI Planner',
              content: (
                <>
                  {/* Centered glowing green button if no schedule exists */}
                  {!aiSchedule && !aiLoading && (
                    <div className="flex flex-col items-center justify-center py-24">
                      <button
                        className="bg-[#10B981] hover:bg-[#0e946d] transition rounded-full py-5 px-12 font-bold text-black text-2xl shadow-[0_0_40px_#10B981,0_0_80px_#10B981] focus:outline-none animate-pulse"
                        onClick={generateAISchedule}
                        disabled={aiLoading}
                      >
                        Generate AI Schedule
                      </button>
                    </div>
                  )}
                  {/* Loading spinner */}
                  {aiLoading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-6 text-gray-400">
                      <svg className="animate-spin h-12 w-12 text-[#10B981] mb-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      <p className="text-lg font-semibold">Generating your plan...</p>
                    </div>
                  )}
                  {/* Once schedule exists, show it and manual add-task UI */}
                  {aiSchedule && !aiLoading && (
                    <>
                      <pre className="whitespace-pre-wrap bg-[#16213E] p-4 rounded-md text-white max-h-64 overflow-y-auto mb-8">
                        {aiSchedule}
                      </pre>
                      {/* Manual task add UI */}
                      <div className="flex flex-col items-center mb-8">
                        <h3 className="text-lg font-semibold mb-2 text-white">Add a Custom Task</h3>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Task name"
                            value={manualTaskName}
                            onChange={e => setManualTaskName(e.target.value)}
                            className="rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                          />
                          <input
                            type="time"
                            value={manualTaskTime}
                            onChange={e => setManualTaskTime(e.target.value)}
                            className="rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                          />
                          <button
                            onClick={addManualTask}
                            className="bg-[#10B981] hover:bg-[#0e946d] transition rounded-full py-3 px-6 font-bold text-black shadow-[0_0_15px_#10B981]"
                          >
                            Add
                          </button>
                        </div>
                        {/* List of manually added tasks */}
                        <ul className="w-full max-w-md space-y-2">
                          {aiManualTasks.map((task, i) => (
                            <li key={i} className="bg-[#16213E] rounded-md px-4 py-2 text-white flex justify-between items-center">
                              <span>{task.name} <span className="text-[#3B82F6] text-xs ml-2">{task.time}</span></span>
                              <button onClick={() => removeManualTask(i)} className="text-red-300 hover:text-red-500 font-bold">Remove</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Feedback box after AI schedule generation */}
                      <div className="flex flex-col items-center mb-8">
                        <h3 className="text-lg font-semibold mb-2 text-white">How was your AI-generated schedule?</h3>
                        {aiFeedbackSubmitted ? (
                          <div className="text-green-400 font-semibold">Thank you for your feedback!</div>
                        ) : (
                          <form
                            className="w-full max-w-md flex flex-col gap-2"
                            onSubmit={async e => {
                              e.preventDefault();
                              await sendFeedback();
                            }}
                          >
                            <textarea
                              className="rounded-lg bg-[#16213E] border border-[#3B82F6] px-4 py-3 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                              placeholder="Let us know what you think..."
                              rows={3}
                              value={aiFeedback}
                              onChange={e => setAiFeedback(e.target.value)}
                              required
                            />
                            <button
                              type="submit"
                              className="bg-[#3B82F6] hover:bg-[#2563EB] transition rounded-full py-2 px-6 font-bold text-black shadow-[0_0_10px_#3B82F6] self-end"
                            >
                              Submit Feedback
                            </button>
                          </form>
                        )}
                      </div>
                    </>
                  )}

                </>
              )
            },

          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>


      {/* Edit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#121B2E] rounded-xl shadow-lg p-6 w-96"
          >
            <h3 className="text-xl font-semibold mb-4 text-white">Edit Task</h3>
            <label className="block mb-2 text-white">
              Name
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full rounded-md bg-[#16213E] border border-[#3B82F6] px-3 py-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </label>
            <label className="block mb-2 text-white">
              Priority
              <select
                value={editPriority}
                onChange={e => setEditPriority(e.target.value)}
                className="w-full rounded-md bg-[#16213E] border border-[#3B82F6] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="block mb-2 text-white">
              Start Time
              <input
                type="time"
                value={editStartTime}
                onChange={e => setEditStartTime(e.target.value)}
                className="w-full rounded-md bg-[#16213E] border border-[#3B82F6] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </label>
            <label className="block mb-4 text-white">
              Duration (minutes)
              <input
                type="number"
                min="0"
                value={editDurationMinutes}
                onChange={e => setEditDurationMinutes(Number(e.target.value))}
                className="w-full rounded-md bg-[#16213E] border border-[#3B82F6] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </label>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveTaskEdits}
                className="px-4 py-2 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-black font-semibold shadow-[0_0_12px_#3B82F6]"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}