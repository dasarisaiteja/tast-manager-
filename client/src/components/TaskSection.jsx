import React from 'react';

export default function TaskSection({
  tasks,
  projects,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  projectFilter,
  setProjectFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onOpenCreateModal,
  onUpdateStatus,
  updatingTaskId,
  isLoading,
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Task Management</h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Filter, track, and update task statuses in real-time</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Cards
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
          >
            <span>+ Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, assignee..."
          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task List / Table */}
      {isLoading && tasks.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No tasks match the selected criteria</p>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or create a new task.</p>
          <button
            onClick={onOpenCreateModal}
            className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow"
          >
            + Create New Task
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status (Click to update)</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{task.title}</div>
                    {task.description && (
                      <div className="text-slate-500 text-[11px] line-clamp-1">{task.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {task.projectId?.name || 'Unknown Project'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      disabled={updatingTaskId === task._id}
                      onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                      className={`text-xs font-semibold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : task.status === 'In Progress'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {task.assignedTo.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-slate-800">{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    task.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : task.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {task.priority}
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {task.projectId?.name || 'Project'}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
              {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <select
                  value={task.status}
                  disabled={updatingTaskId === task._id}
                  onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                  className="text-xs font-semibold py-1 px-2 rounded-md border cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className="text-xs text-slate-600">{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
