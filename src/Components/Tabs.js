import React from 'react';

/**
 * Minimal, modern Tabs component.
 * Props:
 * - tabs: Array<{ label: string, content: React.ReactNode }>
 * - activeTab: number
 * - onTabChange: (idx: number) => void
 */
export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div>
      <div className="flex border-b border-[#334155] mb-6">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-6 py-2 font-semibold focus:outline-none transition-colors duration-200
              ${activeTab === idx
                ? 'border-b-2 border-[#3B82F6] text-[#3B82F6] bg-[#16213E]'
                : 'text-gray-400 hover:text-[#3B82F6]'}`}
            style={{ borderRadius: '12px 12px 0 0' }}
            onClick={() => onTabChange(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[activeTab].content}</div>
    </div>
  );
}
