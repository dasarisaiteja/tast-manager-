import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ProjectSection from './components/ProjectSection';
import TaskSection from './components/TaskSection';
import CreateProjectModal from './components/CreateProjectModal';
import CreateTaskModal from './components/CreateTaskModal';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taskflow_user') || 'null');
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [projectStatusFilter, setProjectStatusFilter] = useState('All');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('All');
  const [taskProjectFilter, setTaskProjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projs, tsks, emps] = await Promise.all([
        api.getProjects(projectStatusFilter),
        api.getTasks({
          status: taskStatusFilter,
          priority: taskPriorityFilter,
          projectId: taskProjectFilter,
        }),
        api.getTenantEmployees().catch(() => []),
      ]);

      setProjects(projs);
      setTasks(tsks);
      setEmployees(emps);
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load or bootstrap demo
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    if (!token) {
      handleSeedDemo(true);
    } else {
      loadData();
    }
  }, []);

  // Re-fetch on filter change
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      loadData();
    }
  }, [projectStatusFilter, taskStatusFilter, taskPriorityFilter, taskProjectFilter]);

  const handleSeedDemo = async (isAuto = false) => {
    setIsLoading(true);
    try {
      const res = await api.seedDemoWorkspace();
      localStorage.setItem('taskflow_token', res.token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      addToast('success', isAuto ? 'Welcome! Demo workspace ready.' : 'Demo workspace refreshed!');
      await loadData();
    } catch (err) {
      addToast('error', `Workspace init error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (data) => {
    if (isSubmittingProject) return;
    setIsSubmittingProject(true);
    try {
      const created = await api.createProject(data);
      addToast('success', `Project "${created.name}" created!`);
      setIsProjectModalOpen(false);
      await loadData();
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleCreateTask = async (data) => {
    if (isSubmittingTask) return;
    setIsSubmittingTask(true);
    try {
      const created = await api.createTask(data);
      addToast('success', `Task "${created.title}" created!`);
      setIsTaskModalOpen(false);
      await loadData();
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    if (updatingTaskId === taskId) return;
    setUpdatingTaskId(taskId);
    try {
      await api.updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      addToast('success', `Task status updated to "${newStatus}"`);
    } catch (err) {
      addToast('error', err.message);
      await loadData();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.projectId?.name?.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const metrics = useMemo(() => {
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'Active').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'Completed').length,
      inProgressTasks: tasks.filter((t) => t.status === 'In Progress').length,
      pendingTasks: tasks.filter((t) => t.status === 'Pending').length,
      highPriority: tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed').length,
    };
  }, [projects, tasks]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-sm flex items-start gap-3 transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span className="font-bold">{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <Navbar
        currentUser={currentUser}
        onRefresh={loadData}
        onLoadDemo={() => handleSeedDemo(false)}
        onOpenCreateProject={() => setIsProjectModalOpen(true)}
        onOpenCreateTask={() => setIsTaskModalOpen(true)}
        isLoading={isLoading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <StatsCards metrics={metrics} />

        <ProjectSection
          projects={projects}
          statusFilter={projectStatusFilter}
          setStatusFilter={setProjectStatusFilter}
          selectedProjectId={taskProjectFilter}
          setSelectedProjectId={setTaskProjectFilter}
          onOpenCreateModal={() => setIsProjectModalOpen(true)}
          isLoading={isLoading}
        />

        <TaskSection
          tasks={filteredTasks}
          projects={projects}
          statusFilter={taskStatusFilter}
          setStatusFilter={setTaskStatusFilter}
          priorityFilter={taskPriorityFilter}
          setPriorityFilter={setTaskPriorityFilter}
          projectFilter={taskProjectFilter}
          setProjectFilter={setTaskProjectFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenCreateModal={() => setIsTaskModalOpen(true)}
          onUpdateStatus={handleUpdateStatus}
          updatingTaskId={updatingTaskId}
          isLoading={isLoading}
        />
      </main>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        isSubmitting={isSubmittingProject}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        employees={employees}
        isSubmitting={isSubmittingTask}
      />
    </div>
  );
}
