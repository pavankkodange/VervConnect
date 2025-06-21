import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task, WorkflowTemplate, Inventory, MaintenanceRequest } from '../types';

interface OperationsContextType {
  tasks: Task[];
  workflows: WorkflowTemplate[];
  inventory: Inventory[];
  maintenanceRequests: MaintenanceRequest[];
  
  // Task management
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  assignTask: (taskId: string, userId: string) => void;
  completeTask: (taskId: string, notes?: string) => void;
  getTasksByUser: (userId: string) => Task[];
  getTasksByDepartment: (department: string) => Task[];
  getOverdueTasks: () => Task[];
  
  // Workflow management
  createWorkflow: (workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateWorkflow: (workflowId: string, updates: Partial<WorkflowTemplate>) => void;
  deleteWorkflow: (workflowId: string) => void;
  executeWorkflow: (workflowId: string, context: any) => void;
  
  // Inventory management
  addInventoryItem: (item: Omit<Inventory, 'id'>) => void;
  updateInventoryItem: (itemId: string, updates: Partial<Inventory>) => void;
  deleteInventoryItem: (itemId: string) => void;
  updateStock: (itemId: string, quantity: number, operation: 'add' | 'subtract') => void;
  getLowStockItems: () => Inventory[];
  getExpiringSoonItems: (days: number) => Inventory[];
  
  // Maintenance management
  createMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'reportedAt'>) => void;
  updateMaintenanceRequest: (requestId: string, updates: Partial<MaintenanceRequest>) => void;
  assignMaintenanceRequest: (requestId: string, userId: string) => void;
  completeMaintenanceRequest: (requestId: string, workDescription: string, cost?: number) => void;
  getMaintenanceByRoom: (roomNumber: string) => MaintenanceRequest[];
  getOverdueMaintenanceRequests: () => MaintenanceRequest[];
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

// Demo data
const DEMO_TASKS: Task[] = [
  {
    id: '1',
    title: 'Clean Room 203',
    description: 'Deep clean room 203 after guest checkout',
    assignedTo: '3',
    assignedBy: '1',
    department: 'housekeeping',
    priority: 'high',
    status: 'pending',
    category: 'housekeeping',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    estimatedDuration: 45,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    roomNumber: '203'
  },
  {
    id: '2',
    title: 'Fix AC in Room 105',
    description: 'Guest reported AC not working properly',
    assignedTo: '4',
    assignedBy: '1',
    department: 'maintenance',
    priority: 'urgent',
    status: 'in-progress',
    category: 'maintenance',
    dueDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    estimatedDuration: 60,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    roomNumber: '105'
  }
];

const DEMO_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Guest Check-in Process',
    description: 'Standard workflow for guest check-in',
    department: 'front-desk',
    trigger: 'check-in',
    steps: [
      {
        id: '1',
        order: 1,
        title: 'Verify Reservation',
        description: 'Check booking details and guest ID',
        assignedRole: 'front-desk',
        estimatedDuration: 5,
        required: true
      },
      {
        id: '2',
        order: 2,
        title: 'Room Assignment',
        description: 'Assign room and provide key cards',
        assignedRole: 'front-desk',
        estimatedDuration: 10,
        required: true
      },
      {
        id: '3',
        order: 3,
        title: 'Welcome Package',
        description: 'Provide hotel information and amenities guide',
        assignedRole: 'front-desk',
        estimatedDuration: 5,
        required: false
      }
    ],
    active: true,
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 25
  }
];

const DEMO_INVENTORY: Inventory[] = [
  {
    id: '1',
    itemName: 'Toilet Paper',
    category: 'amenities',
    currentStock: 50,
    minimumStock: 20,
    maximumStock: 100,
    unit: 'rolls',
    costPerUnit: 2.50,
    supplier: 'Hotel Supplies Co.',
    lastRestocked: '2024-01-20',
    location: 'Storage Room A',
    autoReorder: true,
    reorderPoint: 25,
    reorderQuantity: 50
  },
  {
    id: '2',
    itemName: 'Cleaning Detergent',
    category: 'cleaning',
    currentStock: 15,
    minimumStock: 10,
    maximumStock: 30,
    unit: 'bottles',
    costPerUnit: 8.99,
    supplier: 'CleanPro Supplies',
    lastRestocked: '2024-01-18',
    location: 'Housekeeping Storage',
    autoReorder: true,
    reorderPoint: 12,
    reorderQuantity: 20
  }
];

const DEMO_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: '1',
    roomNumber: '105',
    area: 'HVAC',
    description: 'Air conditioning not cooling properly',
    priority: 'high',
    status: 'in-progress',
    reportedBy: '2',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignedTo: '4',
    assignedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    category: 'hvac',
    estimatedCost: 150,
    preventiveMaintenance: false,
    guestImpact: true,
    roomOutOfOrder: false
  }
];

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(DEMO_WORKFLOWS);
  const [inventory, setInventory] = useState<Inventory[]>(DEMO_INVENTORY);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(DEMO_MAINTENANCE);

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const assignTask = (taskId: string, userId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assignedTo: userId } : task
    ));
  };

  const completeTask = (taskId: string, notes?: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'completed',
            completedAt: new Date().toISOString(),
            notes: notes || task.notes
          } 
        : task
    ));
  };

  const getTasksByUser = (userId: string) => {
    return tasks.filter(task => task.assignedTo === userId);
  };

  const getTasksByDepartment = (department: string) => {
    return tasks.filter(task => task.department === department);
  };

  const getOverdueTasks = () => {
    const now = new Date().toISOString();
    return tasks.filter(task => 
      task.dueDate && task.dueDate < now && task.status !== 'completed'
    );
  };

  const createWorkflow = (workflowData: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    const newWorkflow: WorkflowTemplate = {
      ...workflowData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    setWorkflows(prev => [newWorkflow, ...prev]);
  };

  const updateWorkflow = (workflowId: string, updates: Partial<WorkflowTemplate>) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, ...updates, lastModified: new Date().toISOString() } 
        : workflow
    ));
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
  };

  const executeWorkflow = (workflowId: string, context: any) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Create tasks for each workflow step
    workflow.steps.forEach(step => {
      createTask({
        title: step.title,
        description: step.description,
        assignedTo: '', // Would be assigned based on role
        assignedBy: context.userId || 'system',
        department: workflow.department,
        priority: 'normal',
        status: 'pending',
        category: 'administrative',
        estimatedDuration: step.estimatedDuration,
        ...context
      });
    });

    // Increment usage count
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, usageCount: w.usageCount + 1 } : w
    ));
  };

  const addInventoryItem = (itemData: Omit<Inventory, 'id'>) => {
    const newItem: Inventory = {
      ...itemData,
      id: Date.now().toString()
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryItem = (itemId: string, updates: Partial<Inventory>) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const deleteInventoryItem = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  const updateStock = (itemId: string, quantity: number, operation: 'add' | 'subtract') => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = operation === 'add' 
          ? item.currentStock + quantity 
          : item.currentStock - quantity;
        
        return {
          ...item,
          currentStock: Math.max(0, newStock),
          lastRestocked: operation === 'add' ? new Date().toISOString().split('T')[0] : item.lastRestocked
        };
      }
      return item;
    }));
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.currentStock <= item.minimumStock);
  };

  const getExpiringSoonItems = (days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    return inventory.filter(item => 
      item.expiryDate && item.expiryDate <= futureDateString
    );
  };

  const createMaintenanceRequest = (requestData: Omit<MaintenanceRequest, 'id' | 'reportedAt'>) => {
    const newRequest: MaintenanceRequest = {
      ...requestData,
      id: Date.now().toString(),
      reportedAt: new Date().toISOString()
    };
    setMaintenanceRequests(prev => [newRequest, ...prev]);
  };

  const updateMaintenanceRequest = (requestId: string, updates: Partial<MaintenanceRequest>) => {
    setMaintenanceRequests(prev => prev.map(request => 
      request.id === requestId ? { ...request, ...updates } : request
    ));
  };

  const assignMaintenanceRequest = (requestId: string, userId: string) => {
    setMaintenanceRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            assignedTo: userId,
            assignedAt: new Date().toISOString(),
            status: 'assigned'
          } 
        : request
    ));
  };

  const completeMaintenanceRequest = (requestId: string, workDescription: string, cost?: number) => {
    setMaintenanceRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'completed',
            completedAt: new Date().toISOString(),
            workDescription,
            actualCost: cost
          } 
        : request
    ));
  };

  const getMaintenanceByRoom = (roomNumber: string) => {
    return maintenanceRequests.filter(request => request.roomNumber === roomNumber);
  };

  const getOverdueMaintenanceRequests = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    return maintenanceRequests.filter(request => 
      request.reportedAt < oneDayAgo && 
      request.status !== 'completed' && 
      request.priority === 'urgent'
    );
  };

  return (
    <OperationsContext.Provider value={{
      tasks,
      workflows,
      inventory,
      maintenanceRequests,
      createTask,
      updateTask,
      deleteTask,
      assignTask,
      completeTask,
      getTasksByUser,
      getTasksByDepartment,
      getOverdueTasks,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
      executeWorkflow,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      updateStock,
      getLowStockItems,
      getExpiringSoonItems,
      createMaintenanceRequest,
      updateMaintenanceRequest,
      assignMaintenanceRequest,
      completeMaintenanceRequest,
      getMaintenanceByRoom,
      getOverdueMaintenanceRequests
    }}>
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}