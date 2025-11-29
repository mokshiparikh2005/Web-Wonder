
export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  InProgress = 'In Progress',
  Done = 'Done',
  Delayed = 'Delayed',
  Paid = 'Paid',
}

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum TaskCategory {
  Creative = 'Creative',
  Reels = 'Reels',
  Static = 'Static',
  Copywriting = 'Copywriting',
  AdSetup = 'Ad Setup',
  Website = 'Website',
  Reporting = 'Reporting',
  Misc = 'Misc',
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  joiningDate: string;
  salary: number;
  avatar: string;
}

export interface Client {
  id: string;
  name: string;
  brandName: string;
  onboardingDate: string;
  serviceType: string;
  monthlyRetainer: number;
  status: 'Active' | 'Inactive';
  assignedEmployeeIds: string[];
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  assignedEmployeeId: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Done' | 'Delayed';
  timeEstimated: number; // in hours
  timeSpent: number; // in milliseconds (accumulated)
  isRunning: boolean;
  lastStartTime?: number; // timestamp when timer started
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  date: string;
  amount: number;
  category: string; // e.g., 'Retainer', 'Software', 'Vendor'
  entityName: string; // Client Name or Vendor Name
  status: 'Paid' | 'Pending';
  notes?: string;
}

export interface AppState {
  clients: Client[];
  employees: Employee[];
  tasks: Task[];
  transactions: Transaction[];
  currentUserRole: 'Admin' | 'Manager' | 'Employee';
}

export type ViewMode = 'Dashboard' | 'Clients' | 'Tasks' | 'Employees' | 'Finance' | 'Reports';
