import { createClient } from '@/lib/supabase/client';

export type AdminSection = 
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'reviews'
  | 'coupons'
  | 'gift-cards'
  | 'settings'
  | 'users';

export type UserRole = 'admin' | 'manager' | 'customer';

export interface Permission {
  section: AdminSection;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  permissions: Permission[];
}

export const ADMIN_SECTIONS: { key: AdminSection; label: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'gift-cards', label: 'Gift Cards' },
  { key: 'settings', label: 'Settings' },
  { key: 'users', label: 'User Management' },
];

/**
 * Get user permissions from the database
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('admin_permissions')
    .select('section, can_view, can_edit, can_delete')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data as Permission[];
}

/**
 * Get user role from profiles
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = createClient();
  if (!supabase) return 'customer';

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return 'customer';
  return (data.role as UserRole) || 'customer';
}

/**
 * Check if a user can access a specific admin section
 */
export async function canAccessSection(
  userId: string,
  section: AdminSection,
  action: 'view' | 'edit' | 'delete' = 'view'
): Promise<boolean> {
  const role = await getUserRole(userId);
  
  // Admins have full access
  if (role === 'admin') return true;
  
  // Customers have no admin access
  if (role === 'customer') return false;
  
  // Managers need explicit permissions
  const permissions = await getUserPermissions(userId);
  const sectionPerm = permissions.find(p => p.section === section);
  
  if (!sectionPerm) return false;
  
  switch (action) {
    case 'view': return sectionPerm.can_view;
    case 'edit': return sectionPerm.can_edit;
    case 'delete': return sectionPerm.can_delete;
    default: return false;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  return !error;
}

/**
 * Set permissions for a user
 */
export async function setUserPermissions(
  userId: string,
  permissions: { section: AdminSection; can_view: boolean; can_edit: boolean; can_delete: boolean }[]
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  // Delete existing permissions
  await supabase.from('admin_permissions').delete().eq('user_id', userId);

  // Insert new permissions
  if (permissions.length > 0) {
    const { error } = await supabase
      .from('admin_permissions')
      .insert(permissions.map(p => ({ user_id: userId, ...p })));
    
    if (error) return false;
  }

  return true;
}

/**
 * Get all admin/manager users with their permissions
 */
export async function getAdminUsers(): Promise<UserWithPermissions[]> {
  const supabase = createClient();
  if (!supabase) return [];

  // Get all non-customer users
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .in('role', ['admin', 'manager'])
    .order('role', { ascending: true });

  if (usersError || !users) return [];

  // Get permissions for each user
  const usersWithPermissions: UserWithPermissions[] = [];
  
  for (const user of users) {
    const permissions = await getUserPermissions(user.id);
    usersWithPermissions.push({
      ...user,
      role: user.role as UserRole,
      permissions,
    });
  }

  return usersWithPermissions;
}
