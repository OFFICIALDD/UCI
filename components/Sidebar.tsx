import React from 'react';
import { AppMode } from '../types';
import { 
  Code2, 
  Activity, 
  ArrowRightLeft, 
  GitGraph, 
  Play, 
  Cpu,
  GitCompare
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const menuItems = [
    { id: AppMode.GENERATOR, label: 'Generator', icon: <Code2 size={20} /> },
    { id: AppMode.ANALYZER, label: 'Inspector', icon: <Activity size={20} /> },
    { id: AppMode.CONVERTER, label: 'Converter', icon: <ArrowRightLeft size={20} /> },
    { id: AppMode.DIFF, label: 'Diff Viewer', icon: <GitCompare size={20} /> },
    { id: AppMode.FLOWCHART, label: 'Visualizer', icon: <GitGraph size={20} /> },
    { id: AppMode.RUNNER, label: 'Simulate', icon: <Play size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-900/20">
            <Cpu className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">UCI</h1>
          <span className="text-xs text-gray-500 font-medium">Code Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentMode === item.id
                ? 'bg-gray-800 text-purple-400 border border-purple-500/20 shadow-md'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-green-400">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;