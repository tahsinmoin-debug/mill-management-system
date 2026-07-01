"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Edit2, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/wage-calc";
import { getUsers, createUser, deleteUser } from "@/app/actions/users";

export default function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("MANAGER");

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    if (!newName || !newUsername || !newPassword || !newRole) return;
    startTransition(async () => {
      await createUser({
        name: newName,
        username: newUsername,
        passwordHash: newPassword, // Action will hash it
        role: newRole,
      });
      setShowAddModal(false);
      setNewName("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("MANAGER");
      fetchUsers();
    });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      startTransition(async () => {
        await deleteUser(id);
        fetchUsers();
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">System Users</h2>
          <p className="text-sm text-text-muted mt-1">
            Manage admin and manager accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-blue text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-accent-cyan/20 transition-all"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary bg-bg-secondary/50">
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Username
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border-primary/50 hover:bg-bg-card-hover/50 transition-colors"
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          user.role === "ADMIN"
                            ? "bg-gradient-to-br from-accent-purple to-accent-blue"
                            : "bg-gradient-to-br from-accent-cyan to-accent-teal"
                        }`}
                      >
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="font-medium text-text-primary">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className="font-mono text-xs text-text-secondary">
                      {user.username}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <StatusBadge status={user.role} />
                  </td>
                  <td className="py-3 px-5 text-text-secondary">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isPending || user.username === "Toma"} // Protect main admin
                      title="Delete User"
                      className="p-1.5 rounded-lg hover:bg-accent-red/10 text-text-muted hover:text-accent-red transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-bg-card border border-border-primary">
        <ShieldAlert size={18} className="text-text-muted shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-text-primary">Role Permissions</p>
          <ul className="mt-2 space-y-1 text-xs text-text-muted list-disc list-inside">
            <li>
              <strong className="text-accent-purple">ADMIN:</strong> Full access to all
              features, including wage rate settings and user management.
            </li>
            <li>
              <strong className="text-accent-blue">MANAGER:</strong> Can enter daily
              production data, manage machines/workers, and view reports. Cannot
              access settings.
            </li>
          </ul>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Jamal Hossain"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. jamal.h"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Role
            </label>
            <select 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
            >
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddUser}
              disabled={isPending || !newName || !newUsername || !newPassword}
              className="flex-1 flex justify-center items-center py-2.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : "Add User"}
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              disabled={isPending}
              className="px-6 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-lg text-sm hover:bg-bg-card-hover transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
