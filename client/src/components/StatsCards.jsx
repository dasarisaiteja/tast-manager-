import React from 'react';

export default function StatsCards({ metrics }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Projects</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalProjects}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">{metrics.activeProjects} active</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
          📁
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tasks</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalTasks}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{metrics.completedTasks} completed</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">
          ✅
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{metrics.inProgressTasks}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{metrics.pendingTasks} pending</p>
        </div>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg">
          ⏳
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">High Priority</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{metrics.highPriority}</h3>
          <p className="text-xs text-rose-500 font-medium mt-0.5">Needs attention</p>
        </div>
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-lg">
          🚨
        </div>
      </div>
    </section>
  );
}
