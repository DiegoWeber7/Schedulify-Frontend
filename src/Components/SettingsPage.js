import React, { useState } from 'react';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Sidebar */}
      <div className={`w-64 shadow-md p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <h2 className="text-xl font-bold mb-6">Settings</h2>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'profile' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'
              }`}
            >
              Profile
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'preferences' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'
              }`}
            >
              Preferences
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === 'security' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'
              }`}
            >
              Security
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Profile Information</h3>
            <div className="mb-4">
              <label className={`block mb-1 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
              <input
                type="text"
                className={`w-full border p-2 rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="mb-6">
              <label className={`block mb-1 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input
                type="email"
                className={`w-full border p-2 rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Preferences</h3>

            <div className="mb-6 flex items-center justify-between">
              <label htmlFor="notifications" className="text-lg font-medium">Enable notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700 peer-checked:bg-blue-600 transition-colors relative">
                  <span className="absolute right-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out transform peer-checked:-translate-x-[26px]"></span>
                </div>
                <span className="sr-only">Toggle Notifications</span>
              </label>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <label htmlFor="darkMode" className="text-lg font-medium">Enable dark mode</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700 peer-checked:bg-blue-600 transition-colors relative">
                  <span className="absolute right-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out transform peer-checked:-translate-x-[26px]"></span>
                </div>
                <span className="sr-only">Toggle Dark Mode</span>
              </label>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Save Preferences
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Security</h3>
            <p className="text-gray-600">Security options will be available soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;