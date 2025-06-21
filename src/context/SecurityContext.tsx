import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SecurityLog, AuditLog, AccessControl, ComplianceReport } from '../types';

interface SecurityContextType {
  securityLogs: SecurityLog[];
  auditLogs: AuditLog[];
  accessControls: AccessControl[];
  complianceReports: ComplianceReport[];
  
  // Security logging
  logSecurityEvent: (event: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
  logUserAction: (action: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getSecurityLogsByUser: (userId: string) => SecurityLog[];
  getAuditLogsByEntity: (entityType: string, entityId: string) => AuditLog[];
  
  // Access control
  grantAccess: (access: Omit<AccessControl, 'id' | 'grantedAt' | 'active'>) => void;
  revokeAccess: (accessId: string) => void;
  checkPermission: (userId: string, resource: string, permission: string) => boolean;
  getUserPermissions: (userId: string) => AccessControl[];
  
  // Compliance
  generateComplianceReport: (type: ComplianceReport['type'], startDate: string, endDate: string) => ComplianceReport;
  getActiveFindings: () => ComplianceReport['findings'];
  updateFindingStatus: (reportId: string, findingId: string, status: string, resolution?: string) => void;
  
  // Security analytics
  getFailedLoginAttempts: (timeframe: number) => SecurityLog[];
  getSuspiciousActivity: () => SecurityLog[];
  getDataAccessPatterns: (userId: string) => AuditLog[];
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Demo data
const DEMO_SECURITY_LOGS: SecurityLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'login_success',
    resource: 'authentication',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    severity: 'info',
    category: 'authentication'
  },
  {
    id: '2',
    userId: '2',
    action: 'failed_login',
    resource: 'authentication',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: false,
    severity: 'warning',
    category: 'authentication',
    details: { reason: 'invalid_password', attempts: 3 }
  }
];

const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'update',
    entityType: 'booking',
    entityId: '1',
    oldValues: { status: 'confirmed' },
    newValues: { status: 'checked-in' },
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    reason: 'Guest check-in process'
  }
];

const DEMO_ACCESS_CONTROLS: AccessControl[] = [
  {
    id: '1',
    userId: '1',
    resource: 'bookings',
    permissions: ['read', 'write', 'delete'],
    grantedBy: 'system',
    grantedAt: '2024-01-01T00:00:00Z',
    active: true
  },
  {
    id: '2',
    userId: '3',
    resource: 'housekeeping',
    permissions: ['read', 'write'],
    grantedBy: '1',
    grantedAt: '2024-01-01T00:00:00Z',
    active: true
  }
];

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(DEMO_SECURITY_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);
  const [accessControls, setAccessControls] = useState<AccessControl[]>(DEMO_ACCESS_CONTROLS);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);

  const logSecurityEvent = (eventData: Omit<SecurityLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityLog = {
      ...eventData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  const logUserAction = (actionData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...actionData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const getSecurityLogsByUser = (userId: string) => {
    return securityLogs.filter(log => log.userId === userId);
  };

  const getAuditLogsByEntity = (entityType: string, entityId: string) => {
    return auditLogs.filter(log => log.entityType === entityType && log.entityId === entityId);
  };

  const grantAccess = (accessData: Omit<AccessControl, 'id' | 'grantedAt' | 'active'>) => {
    const newAccess: AccessControl = {
      ...accessData,
      id: Date.now().toString(),
      grantedAt: new Date().toISOString(),
      active: true
    };
    setAccessControls(prev => [newAccess, ...prev]);
  };

  const revokeAccess = (accessId: string) => {
    setAccessControls(prev => prev.map(access => 
      access.id === accessId ? { ...access, active: false } : access
    ));
  };

  const checkPermission = (userId: string, resource: string, permission: string) => {
    const userAccess = accessControls.find(access => 
      access.userId === userId && 
      access.resource === resource && 
      access.active &&
      access.permissions.includes(permission)
    );
    return !!userAccess;
  };

  const getUserPermissions = (userId: string) => {
    return accessControls.filter(access => access.userId === userId && access.active);
  };

  const generateComplianceReport = (type: ComplianceReport['type'], startDate: string, endDate: string): ComplianceReport => {
    const report: ComplianceReport = {
      id: Date.now().toString(),
      type,
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
      period: { startDate, endDate },
      findings: [
        {
          id: '1',
          category: 'Data Protection',
          description: 'Guest data retention policy compliance check',
          severity: 'low',
          status: 'resolved'
        },
        {
          id: '2',
          category: 'Access Control',
          description: 'Regular review of user permissions required',
          severity: 'medium',
          status: 'open',
          assignedTo: '1',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ],
      status: 'partial',
      recommendations: [
        'Implement automated data retention policies',
        'Schedule quarterly access control reviews',
        'Enhance security monitoring capabilities'
      ],
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setComplianceReports(prev => [report, ...prev]);
    return report;
  };

  const getActiveFindings = () => {
    return complianceReports
      .flatMap(report => report.findings)
      .filter(finding => finding.status === 'open' || finding.status === 'in-progress');
  };

  const updateFindingStatus = (reportId: string, findingId: string, status: string, resolution?: string) => {
    setComplianceReports(prev => prev.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          findings: report.findings.map(finding => 
            finding.id === findingId 
              ? { 
                  ...finding, 
                  status: status as any,
                  resolution,
                  resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
                }
              : finding
          )
        };
      }
      return report;
    }));
  };

  const getFailedLoginAttempts = (timeframe: number) => {
    const cutoff = new Date(Date.now() - timeframe * 60 * 60 * 1000).toISOString();
    return securityLogs.filter(log => 
      log.action === 'failed_login' && 
      log.timestamp >= cutoff
    );
  };

  const getSuspiciousActivity = () => {
    return securityLogs.filter(log => 
      log.severity === 'warning' || log.severity === 'error'
    );
  };

  const getDataAccessPatterns = (userId: string) => {
    return auditLogs.filter(log => log.userId === userId);
  };

  return (
    <SecurityContext.Provider value={{
      securityLogs,
      auditLogs,
      accessControls,
      complianceReports,
      logSecurityEvent,
      logUserAction,
      getSecurityLogsByUser,
      getAuditLogsByEntity,
      grantAccess,
      revokeAccess,
      checkPermission,
      getUserPermissions,
      generateComplianceReport,
      getActiveFindings,
      updateFindingStatus,
      getFailedLoginAttempts,
      getSuspiciousActivity,
      getDataAccessPatterns
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}