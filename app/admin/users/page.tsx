// FILE: app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  title: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  _count?: {
    placements: number;
    activities: number;
    notes: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'broker',
    phone: '',
    title: '',
    isActive: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session, searchTerm, roleFilter, activeFilter]);

  const fetchUsers = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (activeFilter) params.append('isActive', activeFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('User created successfully');
        setShowAddUser(false);
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'broker',
          phone: '',
          title: '',
          isActive: true
        });
        fetchUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setError('Error creating user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const updateData: any = {
        id: editingUser.id,
        ...formData
      };

      // Don't send password if it's empty
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      setError('Error updating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? Users with placements will be deactivated instead.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'User removed successfully');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (error) {
      setError('Error deleting user');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.role,
      phone: user.phone || '',
      title: user.title || '',
      isActive: user.isActive
    });
    setShowAddUser(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setShowAddUser(true);
                  setEditingUser(null);
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    role: 'broker',
                    phone: '',
                    title: '',
                    isActive: true
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add New User
              </button>
              <Link
                href="/admin/placements"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Manage Placements
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="broker">Broker</option>
              <option value="user">User</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setActiveFilter('');
              }}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 mb-4">
            {successMessage}
          </div>
        )}

        {/* Add/Edit User Panel */}
        {(showAddUser || editingUser) && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="block text-sm font-medium mb-1">Email *</div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium mb-1">
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium mb-1">Name</div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium mb-1">Role</div>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="broker">Broker</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <div className="block text-sm font-medium mb-1">Phone</div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium mb-1">Title</div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Senior Broker"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => {
                    if (editingUser) {
                      handleUpdateUser();
                    } else {
                      handleAddUser();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  onClick={() => {
                    setShowAddUser(false);
                    setEditingUser(null);
                    setFormData({
                      email: '',
                      password: '',
                      name: '',
                      role: 'broker',
                      phone: '',
                      title: '',
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.name || '-'}</div>
                      {user.title && <div className="text-xs text-gray-400">{user.title}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'broker'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user._count?.placements || 0} placements
                    </div>
                    <div className="text-xs text-gray-500">
                      Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => startEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={user.id === session?.user?.id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.id === session?.user?.id}
                    >
                      {user._count?.placements && user._count.placements > 0 ? 'Deactivate' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}