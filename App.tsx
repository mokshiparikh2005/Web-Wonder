
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, CheckSquare, DollarSign, PieChart, 
  Search, Bell, Settings, Menu, Sparkles, Download, Plus, X, 
  CalendarIcon, Filter, ChevronLeft, ChevronRight, MoreVertical, Briefcase,
  Trash2, Edit, FileText, Play, Pause, Clock
} from './components/Icons';
import { 
  AppState, Client, Task, Employee, Transaction, ViewMode, 
  Status, Priority, TaskCategory 
} from './types';
import { generateSmartInsight } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

// --- MOCK DATA INITIALIZATION ---
const initialEmployees: Employee[] = [
  { id: '1', name: 'Alice Creative', role: 'Designer', joiningDate: '2023-01-15', salary: 4000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: '2', name: 'Bob Strategist', role: 'Account Manager', joiningDate: '2023-03-01', salary: 5000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: '3', name: 'Charlie Copy', role: 'Copywriter', joiningDate: '2023-06-10', salary: 3800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
];

const initialClients: Client[] = [
  { id: '1', name: 'Tech Nova', brandName: 'TechNova', onboardingDate: '2024-01-01', serviceType: 'Full Stack', monthlyRetainer: 2500, status: 'Active', assignedEmployeeIds: ['2'], notes: 'Focus on LinkedIn' },
  { id: '2', name: 'Green Earth', brandName: 'GreenEarth', onboardingDate: '2024-02-15', serviceType: 'Social Media', monthlyRetainer: 1500, status: 'Active', assignedEmployeeIds: ['1', '3'], notes: 'Eco-friendly vibe' },
  { id: '3', name: 'Fast Fit', brandName: 'FastFit', onboardingDate: '2023-11-20', serviceType: 'Ads Only', monthlyRetainer: 1200, status: 'Inactive', assignedEmployeeIds: ['2'], notes: 'Paused for season' },
];

const initialTasks: Task[] = [
  { id: '1', title: 'Monthly Report Jan', clientId: '1', assignedEmployeeId: '2', category: TaskCategory.Reporting, priority: Priority.High, dueDate: '2024-10-25', status: 'Done', timeEstimated: 2, timeSpent: 7200000, isRunning: false },
  { id: '2', title: 'Reels Editing', clientId: '2', assignedEmployeeId: '1', category: TaskCategory.Reels, priority: Priority.Medium, dueDate: '2024-10-28', status: 'In Progress', timeEstimated: 4, timeSpent: 3600000, isRunning: false },
  { id: '3', title: 'Ad Copy Draft', clientId: '3', assignedEmployeeId: '3', category: TaskCategory.Copywriting, priority: Priority.High, dueDate: '2024-10-30', status: 'Pending', timeEstimated: 1.5, timeSpent: 0, isRunning: false },
  { id: '4', title: 'Website Update', clientId: '1', assignedEmployeeId: '1', category: TaskCategory.Website, priority: Priority.Low, dueDate: '2024-11-05', status: 'Pending', timeEstimated: 3, timeSpent: 0, isRunning: false },
  { id: '5', title: 'Product Shoot', clientId: '2', assignedEmployeeId: '1', category: TaskCategory.Static, priority: Priority.High, dueDate: '2024-10-26', status: 'Done', timeEstimated: 5, timeSpent: 18000000, isRunning: false },
  { id: '6', title: 'SEO Audit', clientId: '1', assignedEmployeeId: '2', category: TaskCategory.Misc, priority: Priority.Medium, dueDate: '2024-11-01', status: 'In Progress', timeEstimated: 3, timeSpent: 5400000, isRunning: false },
  { id: '7', title: 'Insta Grid Plan', clientId: '2', assignedEmployeeId: '1', category: TaskCategory.Creative, priority: Priority.Low, dueDate: '2024-11-02', status: 'Pending', timeEstimated: 2, timeSpent: 0, isRunning: false },
];

const initialTransactions: Transaction[] = [
  { id: '1', type: 'Income', date: '2024-10-01', amount: 2500, category: 'Retainer', entityName: 'TechNova', status: 'Paid' },
  { id: '2', type: 'Income', date: '2024-10-05', amount: 1500, category: 'Retainer', entityName: 'GreenEarth', status: 'Paid' },
  { id: '3', type: 'Expense', date: '2024-10-10', amount: 50, category: 'Software', entityName: 'Adobe', status: 'Paid' },
  { id: '4', type: 'Expense', date: '2024-10-15', amount: 200, category: 'Ads', entityName: 'Facebook', status: 'Paid' },
];

// --- HELPER COMPONENTS ---

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children?: React.ReactNode;
  color: string;
}

const Badge: React.FC<BadgeProps> = ({ children, color }) => {
  const colorMap: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    red: 'bg-rose-100 text-rose-700',
    yellow: 'bg-amber-100 text-amber-700',
    gray: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.gray}`}>
      {children}
    </span>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Global State
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Gemini State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // View States
  const [taskViewMode, setTaskViewMode] = useState<'Board' | 'List' | 'Calendar'>('Board');

  // Timer State Ticker
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Update 'now' every second to refresh running timers
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTimer = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;

      if (task.isRunning) {
        // Stop Timer
        const sessionDuration = Date.now() - (task.lastStartTime || Date.now());
        return {
          ...task,
          isRunning: false,
          timeSpent: task.timeSpent + sessionDuration,
          lastStartTime: undefined
        };
      } else {
        // Start Timer
        // Stop any other running timer first (optional, but good for single-tasking)
        return {
          ...task,
          isRunning: true,
          lastStartTime: Date.now()
        };
      }
    }));
  };

  // --- DERIVED STATE & FILTERS ---
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(globalSearch.toLowerCase()) || 
      clients.find(c => c.id === t.clientId)?.brandName.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [tasks, globalSearch, clients]);

  const stats = {
    totalClients: clients.length,
    pendingTasks: tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length,
    completedTasks: tasks.filter(t => t.status === 'Done').length,
    income: transactions.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0),
    expense: transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0),
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    const appState: AppState = { clients, employees, tasks, transactions, currentUserRole: 'Admin' };
    const insight = await generateSmartInsight(appState, "Analyze my current workload and financial health. Be brief and actionable.");
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
        + Object.keys(data[0]).join(",") + "\n" 
        + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteItem = (id: string, type: 'client' | 'task' | 'employee') => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (type === 'client') setClients(prev => prev.filter(c => c.id !== id));
      if (type === 'task') setTasks(prev => prev.filter(t => t.id !== id));
      if (type === 'employee') setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      brandName: formData.get('brandName') as string,
      onboardingDate: new Date().toISOString().split('T')[0],
      serviceType: formData.get('serviceType') as string,
      monthlyRetainer: Number(formData.get('monthlyRetainer')),
      status: 'Active',
      assignedEmployeeIds: [],
      notes: ''
    };
    setClients([...clients, newClient]);
    setIsClientModalOpen(false);
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      clientId: formData.get('clientId') as string,
      assignedEmployeeId: formData.get('assignedEmployeeId') as string,
      category: formData.get('category') as TaskCategory,
      priority: formData.get('priority') as Priority,
      dueDate: formData.get('dueDate') as string,
      status: 'Pending',
      timeEstimated: Number(formData.get('timeEstimated')) || 0,
      timeSpent: 0,
      isRunning: false
    };
    setTasks([...tasks, newTask]);
    setIsTaskModalOpen(false);
  };

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      joiningDate: new Date().toISOString().split('T')[0],
      salary: Number(formData.get('salary')),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.get('name')}`
    };
    setEmployees([...employees, newEmp]);
    setIsEmployeeModalOpen(false);
  };

  // --- UI SECTIONS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'indigo' },
          { label: 'Pending Tasks', value: stats.pendingTasks, icon: CheckSquare, color: 'amber' },
          { label: 'Profit (Month)', value: `$${stats.income - stats.expense}`, icon: DollarSign, color: 'emerald' },
          { label: 'Efficiency', value: `${stats.completedTasks + stats.pendingTasks > 0 ? Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100) : 0}%`, icon: PieChart, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className={`flex flex-col justify-between h-32 border-l-4 border-l-${stat.color}-500`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-2 bg-${stat.color}-50 rounded-lg text-${stat.color}-600`}>
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Recent Tasks</h3>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800" onClick={() => setActiveTab('Tasks')}>View All</button>
            </div>
            <div className="space-y-4">
              {tasks.slice(0, 5).map(task => {
                const currentSession = task.isRunning ? now - (task.lastStartTime || now) : 0;
                const totalSpent = task.timeSpent + currentSession;
                
                return (
                <div key={task.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-500">Due {task.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }}
                         className={`p-1.5 rounded-full transition-colors ${task.isRunning ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                       >
                         {task.isRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                       </button>
                       <span className={`text-xs font-mono font-medium ${task.isRunning ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`}>
                         {formatDuration(totalSpent)}
                       </span>
                    </div>
                    <Badge color={task.status === 'Done' ? 'green' : task.status === 'Delayed' ? 'red' : 'blue'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              )})}
            </div>
          </Card>
        </div>

        {/* AI Insight Widget */}
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-yellow-300" size={20} />
              <h3 className="font-bold">Web Wonders AI</h3>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm min-h-[140px] relative z-10">
            {isAiLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : aiInsight ? (
              <p className="text-sm leading-relaxed">{aiInsight}</p>
            ) : (
              <p className="text-sm text-indigo-100">Ready to analyze your agency's performance. Click below to start.</p>
            )}
          </div>
          <button 
            onClick={handleAskAI}
            className="w-full mt-4 bg-white text-indigo-600 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg relative z-10"
          >
            Generate Insights
          </button>
        </Card>
      </div>

      {/* Mini Calendar Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">October 2024</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[600px] text-center text-sm">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="font-medium text-slate-400 py-2">{d}</div>)}
            {Array.from({length: 31}).map((_, i) => {
              const day = i + 1;
              const dateStr = `2024-10-${day < 10 ? '0' + day : day}`;
              const dayTasks = tasks.filter(t => t.dueDate === dateStr);
              return (
                <div key={i} className={`h-24 border border-slate-50 rounded-lg flex flex-col items-start justify-start p-1 relative hover:bg-slate-50 transition-colors ${dayTasks.length > 0 ? 'bg-indigo-50/30' : ''}`}>
                  <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${dayTasks.length > 0 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500'}`}>{day}</span>
                  <div className="w-full mt-1 space-y-1 overflow-hidden">
                    {dayTasks.map(t => (
                      <div key={t.id} className="text-[9px] bg-white border border-slate-100 rounded px-1 py-0.5 truncate shadow-sm">
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Client Management</h2>
        <div className="flex space-x-2">
          <button onClick={() => handleExportCSV(clients, 'clients')} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> <span>Export</span>
          </button>
          <button onClick={() => setIsClientModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">
            <Plus size={16} /> <span>Add Client</span>
          </button>
        </div>
      </div>
      
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Brand</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Retainer</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Team</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {client.brandName.substring(0,2).toUpperCase()}
                     </div>
                     {client.brandName}
                  </td>
                  <td className="p-4 text-slate-600">{client.serviceType}</td>
                  <td className="p-4 text-slate-600 font-mono">${client.monthlyRetainer}</td>
                  <td className="p-4">
                    <Badge color={client.status === 'Active' ? 'green' : 'gray'}>{client.status}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {client.assignedEmployeeIds.map(eid => {
                        const emp = employees.find(e => e.id === eid);
                        return emp ? (
                          <img key={eid} src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full border-2 border-white" title={emp.name} />
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-indigo-600"><Edit size={16} /></button>
                      <button className="text-slate-400 hover:text-rose-600" onClick={() => deleteItem(client.id, 'client')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Task Board</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200">
            <button onClick={() => setTaskViewMode('List')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${taskViewMode === 'List' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>List</button>
            <button onClick={() => setTaskViewMode('Board')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${taskViewMode === 'Board' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>Board</button>
            <button onClick={() => setTaskViewMode('Calendar')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${taskViewMode === 'Calendar' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>Calendar</button>
          </div>
          <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">
            <Plus size={16} /> <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Task Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All Tasks', 'High Priority', 'My Tasks', 'Due Today'].map(f => (
          <button key={f} className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-600 whitespace-nowrap transition-colors">
            {f}
          </button>
        ))}
      </div>

      {taskViewMode === 'Board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Pending', 'In Progress', 'Done', 'Delayed'].map((status) => (
            <div key={status} className="bg-slate-50/50 rounded-xl p-4 min-h-[500px] border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">{status}</h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => {
                  const client = clients.find(c => c.id === task.clientId);
                  const currentSession = task.isRunning ? now - (task.lastStartTime || now) : 0;
                  const totalSpent = task.timeSpent + currentSession;

                  return (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold ${
                          task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>{task.priority}</span>
                        <button onClick={() => deleteItem(task.id, 'task')} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{client?.brandName}</p>
                      
                      {/* Timer Control in Board View */}
                      <div className="flex items-center justify-between bg-slate-50 rounded-md p-2 mb-3">
                         <div className="flex items-center gap-2">
                           <Clock size={12} className="text-slate-400" />
                           <span className={`text-xs font-mono font-semibold ${task.isRunning ? 'text-indigo-600' : 'text-slate-500'}`}>
                             {formatDuration(totalSpent)}
                           </span>
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }}
                           className={`p-1.5 rounded-full transition-colors ${task.isRunning ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-white shadow-sm text-indigo-600 hover:text-indigo-800'}`}
                           title={task.isRunning ? "Stop Timer" : "Start Timer"}
                         >
                           {task.isRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                         </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center text-xs text-slate-400 space-x-1">
                          <CalendarIcon size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700 font-bold ring-2 ring-white">
                          {employees.find(e => e.id === task.assignedEmployeeId)?.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {taskViewMode === 'List' && (
         <Card className="p-0 overflow-hidden">
           <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Task</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Client</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Time Spent</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Priority</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Assignee</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {tasks.map(task => {
                  const currentSession = task.isRunning ? now - (task.lastStartTime || now) : 0;
                  const totalSpent = task.timeSpent + currentSession;

                  return (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{task.title}</td>
                    <td className="p-4 text-slate-600">{clients.find(c => c.id === task.clientId)?.brandName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                           onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }}
                           className={`p-1.5 rounded-full transition-colors ${task.isRunning ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                         >
                           {task.isRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                         </button>
                         <span className={`text-sm font-mono ${task.isRunning ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>
                           {formatDuration(totalSpent)}
                         </span>
                      </div>
                    </td>
                    <td className="p-4">
                       <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{task.priority}</span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{task.dueDate}</td>
                    <td className="p-4">
                      <Badge color={task.status === 'Done' ? 'green' : 'blue'}>{task.status}</Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {employees.find(e => e.id === task.assignedEmployeeId)?.name}
                    </td>
                  </tr>
                )})}
             </tbody>
           </table>
         </Card>
      )}

      {taskViewMode === 'Calendar' && (
        <Card className="p-6">
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500">{d}</div>
            ))}
            {Array.from({length: 35}).map((_, i) => {
              const day = i - 1; // Offset for demo
              const dateStr = `2024-10-${day < 10 ? '0' + day : day}`;
              const dayTasks = day > 0 && day <= 31 ? tasks.filter(t => t.dueDate === dateStr) : [];
              return (
                <div key={i} className="bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors flex flex-col gap-1">
                  {day > 0 && day <= 31 && (
                    <>
                      <span className={`text-xs font-medium mb-1 ${dayTasks.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                      {dayTasks.map(t => (
                        <div key={t.id} className={`text-[10px] px-1.5 py-1 rounded border-l-2 truncate ${t.priority === 'High' ? 'border-red-500 bg-red-50 text-red-700' : 'border-indigo-500 bg-indigo-50 text-indigo-700'}`}>
                          {t.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Financial Overview</h2>
        <button onClick={() => handleExportCSV(transactions, 'finance')} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600">
          <Download size={16} /> <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs Expenses</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Income', amount: stats.income },
                { name: 'Expense', amount: stats.expense },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-0 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <button className="text-xs text-indigo-600 font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {transactions.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.type === 'Income' ? <DollarSign size={16} /> : <CheckSquare size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.entityName}</p>
                    <p className="text-xs text-slate-500">{t.category} • {t.date}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.type === 'Income' ? '+' : '-'}${t.amount}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
        <button onClick={() => setIsEmployeeModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200">
          <Plus size={16} /> <span>Add Employee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => {
          const empTasks = tasks.filter(t => t.assignedEmployeeId === emp.id);
          const completed = empTasks.filter(t => t.status === 'Done').length;
          const total = empTasks.length;
          const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          return (
            <Card key={emp.id} className="flex flex-col items-center text-center hover:shadow-md transition-shadow relative group">
              <button onClick={() => deleteItem(emp.id, 'employee')} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
              <img src={emp.avatar} alt={emp.name} className="w-20 h-20 rounded-full mb-4 border-4 border-indigo-50" />
              <h3 className="text-lg font-bold text-slate-800">{emp.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{emp.role}</p>
              
              <div className="grid grid-cols-3 gap-4 w-full border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">Tasks</p>
                  <p className="font-bold text-slate-700">{total}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Done</p>
                  <p className="font-bold text-emerald-600">{completed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Rate</p>
                  <p className="font-bold text-indigo-600">{efficiency}%</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderReports = () => {
    // Aggregating Data for Charts
    const taskStatusData = [
      { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#10b981' },
      { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length, color: '#f59e0b' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3b82f6' },
      { name: 'Delayed', value: tasks.filter(t => t.status === 'Delayed').length, color: '#ef4444' },
    ];

    const revenueByClient = clients.map(c => ({
      name: c.brandName,
      value: transactions.filter(t => t.entityName === c.brandName && t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
    }));

    const clientEffortData = clients.map(client => {
      const clientTasks = tasks.filter(t => t.clientId === client.id);
      // Use actual time spent if available, else fallback to estimate for reports
      const totalTimeMs = clientTasks.reduce((sum, t) => sum + t.timeSpent, 0);
      const totalTimeHrs = totalTimeMs > 0 ? totalTimeMs / (1000 * 60 * 60) : clientTasks.reduce((sum, t) => sum + t.timeEstimated, 0);
      
      const reelsCount = clientTasks.filter(t => t.category === TaskCategory.Reels).length;
      const staticCount = clientTasks.filter(t => t.category === TaskCategory.Static).length;
      const creativeCount = clientTasks.filter(t => t.category === TaskCategory.Creative).length;
      const copyCount = clientTasks.filter(t => t.category === TaskCategory.Copywriting).length;
      
      return {
        name: client.brandName,
        time: parseFloat(totalTimeHrs.toFixed(1)),
        reels: reelsCount,
        static: staticCount,
        creative: creativeCount,
        copy: copyCount
      };
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Company Reports</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">Last 30 Days</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">Export PDF</button>
          </div>
        </div>

        {/* Client Performance Section */}
        <h3 className="text-xl font-bold text-slate-700 mt-8 mb-4">Client Performance & Efforts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Time Investment (Hours)</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={clientEffortData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                   <Tooltip cursor={{fill: 'transparent'}} />
                   <Bar dataKey="time" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#6366f1', fontSize: 12 }} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Content Production Breakdown</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientEffortData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="reels" stackId="a" fill="#8b5cf6" name="Reels" />
                  <Bar dataKey="static" stackId="a" fill="#ec4899" name="Static" />
                  <Bar dataKey="creative" stackId="a" fill="#10b981" name="Creative" />
                  <Bar dataKey="copy" stackId="a" fill="#f59e0b" name="Copy" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <h3 className="text-xl font-bold text-slate-700 mt-8 mb-4">General Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Task Distribution</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Client</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByClient}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (globalSearch) {
      return (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800">Search Results for "{globalSearch}"</h2>
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Tasks</h3>
            {filteredTasks.length > 0 ? (
               <div className="space-y-2">
                 {filteredTasks.map(t => (
                   <div key={t.id} className="p-3 border rounded hover:bg-slate-50 flex justify-between items-center">
                     <div>
                       <p className="font-medium text-slate-800">{t.title}</p>
                       <p className="text-xs text-slate-500">Client: {clients.find(c => c.id === t.clientId)?.brandName}</p>
                     </div>
                     <Badge color="blue">{t.status}</Badge>
                   </div>
                 ))}
               </div>
            ) : <p className="text-slate-500">No tasks found.</p>}
          </Card>
        </div>
      );
    }

    switch (activeTab) {
      case 'Dashboard': return renderDashboard();
      case 'Clients': return renderClients();
      case 'Tasks': return renderTasks();
      case 'Finance': return renderFinance();
      case 'Employees': return renderEmployees();
      case 'Reports': return renderReports();
      default: return <div className="flex items-center justify-center h-64 text-slate-500">Module under development</div>;
    }
  };

  // --- MAIN LAYOUT ---

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Modals */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Add New Client">
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input required name="name" className="w-full rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Legal Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
            <input required name="brandName" className="w-full rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Display Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
              <select name="serviceType" className="w-full rounded-lg border-slate-200">
                <option>Full Stack</option>
                <option>Social Media</option>
                <option>Ads Only</option>
                <option>SEO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Retainer ($)</label>
              <input required name="monthlyRetainer" type="number" className="w-full rounded-lg border-slate-200" placeholder="2000" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">Create Client</button>
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
            <input required name="title" className="w-full rounded-lg border-slate-200" placeholder="e.g. October Content Calendar" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
              <select name="clientId" className="w-full rounded-lg border-slate-200">
                {clients.map(c => <option key={c.id} value={c.id}>{c.brandName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input required name="dueDate" type="date" className="w-full rounded-lg border-slate-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <select name="assignedEmployeeId" className="w-full rounded-lg border-slate-200">
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select name="priority" className="w-full rounded-lg border-slate-200">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select name="category" className="w-full rounded-lg border-slate-200">
                 {Object.values(TaskCategory).map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Time (Hrs)</label>
              <input name="timeEstimated" type="number" step="0.5" className="w-full rounded-lg border-slate-200" placeholder="2.5" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">Add Task</button>
        </form>
      </Modal>

      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input required name="name" className="w-full rounded-lg border-slate-200" placeholder="Jane Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <input required name="role" className="w-full rounded-lg border-slate-200" placeholder="Designer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary ($)</label>
              <input required name="salary" type="number" className="w-full rounded-lg border-slate-200" placeholder="4000" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">Onboard Employee</button>
        </form>
      </Modal>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out 
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        lg:translate-x-0 ${isDesktopSidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden lg:border-r-0'}
      `}>
        <div className="flex items-center h-16 px-6 border-b border-slate-100 whitespace-nowrap overflow-hidden">
          <div className="min-w-[32px] w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Web Wonders</span>
          <button className="ml-auto lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {[
            { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'Clients', icon: Users, label: 'Clients' },
            { id: 'Tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'Finance', icon: DollarSign, label: 'Finance' },
            { id: 'Reports', icon: PieChart, label: 'Reports' },
            { id: 'Employees', icon: Briefcase, label: 'Employees' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as ViewMode); setIsMobileMenuOpen(false); setGlobalSearch(''); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={`min-w-[20px] ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 whitespace-nowrap overflow-hidden">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Admin" className="min-w-[40px] w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@webwonders.com</p>
            </div>
            <Settings size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isDesktopSidebarOpen ? 'lg:pl-0' : 'lg:pl-0'}`}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
             {/* Mobile Toggle */}
             <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={20} />
             </button>
             {/* Desktop Toggle */}
             <button className="hidden lg:block p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-50" onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}>
               <Menu size={20} />
             </button>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search clients, tasks, or reports..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
