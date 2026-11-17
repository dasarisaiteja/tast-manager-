import React from 'react';

export default function ProjectSection({
  projects,
  statusFilter,
  setStatusFilter,
  selectedProjectId,
  setSelectedProjectId,
  onOpenCreateModal,
  isLoading,
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Projects</h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {projects.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage and track company projects</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['All', 'Active', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md transition ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            <span>+ Add Project</span>
          </button>
        </div>
      </div>

      {isLoading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No projects found</p>
          <p className="text-xs text-slate-500 mt-1">Get started by creating your first project.</p>
          <button
            onClick={onOpenCreateModal}
            className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow"
          >
            + Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isSelected = selectedProjectId === proj._id;
            return (
              <div
                key={proj._id}
                onClick={() => setSelectedProjectId(isSelected ? 'All' : proj._id)}
                className={`cursor-pointer group p-5 rounded-xl border transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base">
                      {proj.name}
                    </h3>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        proj.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>By {proj.createdBy?.name || 'Admin'}</span>
                  <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
