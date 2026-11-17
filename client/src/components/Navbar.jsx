import React from 'react';

export default function Navbar({
  currentUser,
  onRefresh,
  onLoadDemo,
  onOpenCreateProject,
  onOpenCreateTask,
  isLoading,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            TF
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">TaskFlow</h1>
            <span className="text-xs text-slate-500 font-medium">Multi-Tenant Management</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">{currentUser.name}</span>
              <span className="bg-white px-2 py-0.5 rounded text-slate-500 border border-slate-200">
                {currentUser.role}
              </span>
            </div>
          )}

          <button
            onClick={onLoadDemo}
            title="Generate a demo workspace with pre-populated projects and tasks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200"
          >
            <span>✨</span>
            <span className="hidden sm:inline">Load Demo Data</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Data"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
          >
            <span className={isLoading ? 'inline-block animate-spin' : ''}>🔄</span>
          </button>

          <button
            onClick={onOpenCreateProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow"
          >
            <span>+ New Project</span>
          </button>

          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
          >
            <span>+ New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
