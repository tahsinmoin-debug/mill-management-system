"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, UserCog, ShieldCheck, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { formatDate } from "@/lib/wage-calc";
import { getUsers, createUser } from "@/app/actions/users";
import { Skeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

export default function UsersPage() {
  const { t } = useLang();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");

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
    if (!newName || !newUsername || !newPassword) return;
    startTransition(async () => {
      await createUser({
        name: newName,
        username: newUsername,
        passwordHash: newPassword,
        role: newRole,
      });
      setShowAddModal(false);
      setNewName("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("USER");
      fetchUsers();
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center border border-accent-purple/30">
            <UserCog size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{t("users.title")}</h2>
            <p className="text-xs text-text-muted">
              {users.length} {t("users.title")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-accent-purple/20 transition-all shrink-0"
        >
          <Plus size={16} />
          {t("users.add")}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary bg-bg-secondary/50">
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t("users.name")}
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t("users.username")}
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t("users.role")}
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t("users.created")}
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center text-xs font-bold text-accent-purple uppercase">
                        {user.name.slice(0, 2)}
                      </div>
                      <span className="font-medium text-text-primary">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-text-secondary">{user.username}</td>
                  <td className="py-3 px-5">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
                        <ShieldCheck size={12} />
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-bg-secondary text-text-muted border border-border-primary">
                        USER
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-text-muted text-xs">
                    {formatDate(user.createdAt.toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t("users.add_title")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("users.full_name")}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("users.username")}
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("users.password")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("users.role")}
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddUser}
              disabled={isPending || !newName || !newUsername || !newPassword}
              className="flex-1 flex justify-center items-center py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : t("users.add")}
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              disabled={isPending}
              className="px-6 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl text-sm hover:bg-bg-card-hover transition-all"
            >
              {t("users.cancel")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
