"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Search, Users, UserCheck, UserX, Loader2, Power } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { formatDate } from "@/lib/wage-calc";
import { getWorkers, createWorker, updateWorkerStatus } from "@/app/actions/workers";
import { useLang } from "@/lib/i18n";

export default function WorkersPage() {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newWorkerId, setNewWorkerId] = useState("");
  const [newJoiningDate, setNewJoiningDate] = useState("");

  const fetchWorkers = async () => { setIsLoading(true); const data = await getWorkers(); setWorkers(data); setIsLoading(false); };
  useEffect(() => { fetchWorkers(); }, []);

  const handleAddWorker = () => {
    if (!newName || !newWorkerId || !newJoiningDate) return;
    startTransition(async () => {
      await createWorker({ name: newName, workerId: newWorkerId, joiningDate: newJoiningDate });
      setShowAddModal(false); setNewName(""); setNewWorkerId(""); setNewJoiningDate(""); fetchWorkers();
    });
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    startTransition(async () => { await updateWorkerStatus(id, newStatus); fetchWorkers(); });
  };

  const filtered = workers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.workerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCnt = workers.filter((w) => w.status === "ACTIVE").length;
  const inactiveCnt = workers.filter((w) => w.status === "INACTIVE").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center"><Users size={20} /></div>
          <div><p className="text-2xl font-bold text-text-primary">{workers.length}</p><p className="text-xs text-text-muted">{t("workers.total")}</p></div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center"><UserCheck size={20} /></div>
          <div><p className="text-2xl font-bold text-text-primary">{activeCnt}</p><p className="text-xs text-text-muted">{t("workers.active")}</p></div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-red/15 text-accent-red flex items-center justify-center"><UserX size={20} /></div>
          <div><p className="text-2xl font-bold text-text-primary">{inactiveCnt}</p><p className="text-xs text-text-muted">{t("workers.inactive")}</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border-primary rounded-xl flex-1 w-full sm:w-auto">
          <Search size={16} className="text-text-muted shrink-0" />
          <input type="text" placeholder={t("workers.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          {[["ALL", t("workers.all")], ["ACTIVE", t("workers.active")], ["INACTIVE", t("workers.inactive")]].map(([s, label]) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30" : "bg-bg-card text-text-muted border border-border-primary hover:text-text-primary"}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-blue text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-accent-cyan/20 transition-all">
          <Plus size={16} />{t("workers.add")}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary bg-bg-secondary/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">{t("workers.name")}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">{t("workers.id")}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">{t("workers.joining")}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">{t("workers.status")}</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-text-muted uppercase">{t("workers.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((worker) => (
                <tr key={worker.id} className="border-b border-border-primary/50 hover:bg-bg-card-hover/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 flex items-center justify-center text-xs font-bold text-accent-cyan">
                        {worker.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-text-primary">{worker.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted font-mono text-xs">{worker.workerId}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(worker.joiningDate)}</td>
                  <td className="py-3 px-4"><StatusBadge status={worker.status} /></td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => toggleStatus(worker.id, worker.status)} disabled={isPending}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${worker.status === "ACTIVE" ? "hover:bg-accent-red/10 text-text-muted hover:text-accent-red" : "hover:bg-accent-green/10 text-text-muted hover:text-accent-green"}`}>
                      <Power size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t("workers.add_title")}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">{t("workers.name")}</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. রহিম মিয়া"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">{t("workers.id")}</label>
            <input type="text" value={newWorkerId} onChange={(e) => setNewWorkerId(e.target.value)} placeholder="e.g. W001"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">{t("workers.joining")}</label>
            <input type="date" value={newJoiningDate} onChange={(e) => setNewJoiningDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddWorker} disabled={isPending || !newName || !newWorkerId || !newJoiningDate}
              className="flex-1 flex justify-center items-center py-2.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : t("workers.add")}
            </button>
            <button onClick={() => setShowAddModal(false)} disabled={isPending}
              className="px-6 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl text-sm hover:bg-bg-card-hover transition-all">
              {t("workers.cancel")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
