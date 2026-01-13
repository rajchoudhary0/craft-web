'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Shield, ShieldCheck, UserCog, Loader2, 
  Check, X, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdmin } from '@/lib/admin-context';
import { useToast } from '@/components/ui/Toast';
import { 
  ADMIN_SECTIONS, 
  type AdminSection, 
  type UserRole,
  type Permission,
  type UserWithPermissions,
  getAdminUsers,
  updateUserRole,
  setUserPermissions,
  getUserPermissions
} from '@/lib/permissions';

interface AllUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAdmin();
  const { showToast } = useToast();
  const [adminUsers, setAdminUsers] = useState<UserWithPermissions[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNewUser, setSelectedNewUser] = useState<string | null>(null);
  
  const supabase = createClient();
  
  // Check if current user is admin (managers can't access this page)
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch admin/manager users
    const admins = await getAdminUsers();
    setAdminUsers(admins);
    
    // Fetch all users for the "Add User" modal
    if (supabase) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('email');
      
      if (users) setAllUsers(users as AllUser[]);
    }
    
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // SECURITY: Prevent admin from demoting themselves
    if (userId === currentUser?.id && newRole !== 'admin') {
      showToast('You cannot remove your own admin access.', 'warning');
      return;
    }
    
    setSaving(userId);
    const success = await updateUserRole(userId, newRole);
    if (success) {
      // If demoting to customer, remove from admin list
      if (newRole === 'customer') {
        setAdminUsers(adminUsers.filter(u => u.id !== userId));
      } else {
        setAdminUsers(adminUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
      }
    }
    setSaving(null);
  };

  const handlePermissionChange = async (
    userId: string, 
    section: AdminSection, 
    field: 'can_view' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    const user = adminUsers.find(u => u.id === userId);
    if (!user) return;

    // Update local state first
    const updatedPermissions = [...user.permissions];
    const existingPerm = updatedPermissions.find(p => p.section === section);
    
    if (existingPerm) {
      existingPerm[field] = value;
      // If turning off view, also turn off edit and delete
      if (field === 'can_view' && !value) {
        existingPerm.can_edit = false;
        existingPerm.can_delete = false;
      }
    } else {
      updatedPermissions.push({
        section,
        can_view: field === 'can_view' ? value : false,
        can_edit: field === 'can_edit' ? value : false,
        can_delete: field === 'can_delete' ? value : false,
      });
    }

    setAdminUsers(adminUsers.map(u => 
      u.id === userId ? { ...u, permissions: updatedPermissions } : u
    ));

    // Save to database
    await setUserPermissions(userId, updatedPermissions);
  };

  const handleAddManager = async () => {
    if (!selectedNewUser) return;
    setSaving('new');
    
    const success = await updateUserRole(selectedNewUser, 'manager');
    if (success) {
      const user = allUsers.find(u => u.id === selectedNewUser);
      if (user) {
        setAdminUsers([...adminUsers, {
          ...user,
          role: 'manager' as UserRole,
          permissions: [],
        }]);
      }
    }
    
    setShowAddModal(false);
    setSelectedNewUser(null);
    setSaving(null);
  };

  const filteredUsers = adminUsers.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableUsersToAdd = allUsers.filter(u => 
    u.role === 'customer' && 
    !adminUsers.some(a => a.id === u.id)
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-terracotta/20 text-terracotta';
      case 'manager': return 'bg-sage/20 text-sage-dark';
      default: return 'bg-clay/20 text-text-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // SECURITY: Block managers from accessing this page
  if (!isCurrentUserAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-12 h-12 text-terracotta mb-4" />
        <h2 className="text-xl font-serif font-bold text-text-dark mb-2">Access Denied</h2>
        <p className="text-text-muted">Only Admins can manage user roles and permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-dark">User Management</h1>
          <p className="text-text-muted">{adminUsers.length} admin/manager users</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-cream rounded-xl hover:bg-terracotta-dark transition-colors"
        >
          <UserCog className="w-5 h-5" />
          Add Manager
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-cream border border-clay/20 rounded-xl focus:outline-none focus:border-terracotta"
        />
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded-2xl">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-dark mb-2">No admin users found</h3>
          <p className="text-text-muted">Add managers to control access to admin sections.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-cream rounded-2xl overflow-hidden">
              {/* User Row */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-sand/30 transition-colors"
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              >
                <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-5 h-5 text-terracotta" />
                  ) : (
                    <Shield className="w-5 h-5 text-sage-dark" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-text-dark">{user.full_name || user.email}</p>
                  <p className="text-sm text-text-muted">{user.email}</p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                
                {expandedUser === user.id ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </div>

              {/* Expanded Permissions Panel */}
              <AnimatePresence>
                {expandedUser === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-clay/20"
                  >
                    <div className="p-6 space-y-6">
                      {/* Role Selector */}
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-text-dark">Role:</label>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          disabled={saving === user.id}
                          className="px-4 py-2 bg-white border border-clay/20 rounded-lg focus:outline-none focus:border-terracotta"
                        >
                          <option value="admin">Admin (Full Access)</option>
                          <option value="manager">Manager (Limited Access)</option>
                          <option value="customer">Customer (Remove Admin Access)</option>
                        </select>
                        {saving === user.id && <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>

                      {/* Permissions Grid (only for managers) */}
                      {user.role === 'manager' && (
                        <div>
                          <h4 className="text-sm font-medium text-text-dark mb-4">Section Permissions</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-clay/20">
                                  <th className="text-left py-2 font-medium text-text-muted">Section</th>
                                  <th className="text-center py-2 font-medium text-text-muted w-20">View</th>
                                  <th className="text-center py-2 font-medium text-text-muted w-20">Edit</th>
                                  <th className="text-center py-2 font-medium text-text-muted w-20">Delete</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ADMIN_SECTIONS.filter(s => s.key !== 'users').map(section => {
                                  const perm = user.permissions.find(p => p.section === section.key);
                                  return (
                                    <tr key={section.key} className="border-b border-clay/10">
                                      <td className="py-3 text-text-dark">{section.label}</td>
                                      <td className="py-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={perm?.can_view || false}
                                          onChange={(e) => handlePermissionChange(user.id, section.key, 'can_view', e.target.checked)}
                                          className="w-4 h-4 accent-terracotta"
                                        />
                                      </td>
                                      <td className="py-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={perm?.can_edit || false}
                                          disabled={!perm?.can_view}
                                          onChange={(e) => handlePermissionChange(user.id, section.key, 'can_edit', e.target.checked)}
                                          className="w-4 h-4 accent-terracotta disabled:opacity-50"
                                        />
                                      </td>
                                      <td className="py-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={perm?.can_delete || false}
                                          disabled={!perm?.can_view}
                                          onChange={(e) => handlePermissionChange(user.id, section.key, 'can_delete', e.target.checked)}
                                          className="w-4 h-4 accent-terracotta disabled:opacity-50"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {user.role === 'admin' && (
                        <p className="text-sm text-text-muted italic">
                          Admins have full access to all sections. No additional permissions needed.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Add Manager Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-cream rounded-2xl p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-text-dark mb-4">Add Manager</h3>
              <p className="text-sm text-text-muted mb-4">
                Select a user to grant them manager access. You can configure their permissions afterward.
              </p>
              
              <select
                value={selectedNewUser || ''}
                onChange={(e) => setSelectedNewUser(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-clay/20 rounded-xl mb-6 focus:outline-none focus:border-terracotta"
              >
                <option value="">Select a user...</option>
                {availableUsersToAdd.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} {user.full_name ? `(${user.full_name})` : ''}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-clay/20 rounded-lg hover:bg-sand transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddManager}
                  disabled={!selectedNewUser || saving === 'new'}
                  className="px-4 py-2 bg-terracotta text-cream rounded-lg hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                >
                  {saving === 'new' ? 'Adding...' : 'Add Manager'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
