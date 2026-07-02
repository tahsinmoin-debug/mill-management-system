"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Search, Factory, Wrench, Loader2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { getMachines, createMachine, updateMachineStatus } from "@/app/actions/machines";
import { useLang } from "@/lib/i18n";

export default function MachinesPage() {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newMachineNum, setNewMachineNum] = useState("");
  const [newTypeModel, setNewTypeModel] = useState("");

  const fetchMachines = async () => { setIsLoading(true); const data = await getMachines(); setMachines(data); setIsLoading(false); };
  useEffect(() => { fetchMachines(); }, []);

  const handleAddMachine = () => {
    if (!newMachineNum || !newTypeModel) return;
    startTransition(async () => {
      await createMachine({ machineNumber: parseInt(newMachineNum), typeModel: newTypeModel });
      setShowAddModal(false); setNewMachineNum(""); setNewTypeModel(""); fetchMachines();
    });
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "UNDER_REPAIR" : "ACTIVE";
    startTransition(async () => { await updateMachineStatus(id, newStatus); fetchMachines(); });
  };

  const filtered = machines.filter((m) => {
    const matchesSearch = m.machineNumber.toString().includes(searchQuery) || m.typeModel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCnt = machines.filter((m) => m.status === "ACTIVE").length;
  const repairCnt = machines.filter((m) => m.status === "UNDER_REPAIR").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center"><Factory size={20} /></div>
          <div><p className="text-2xl font-bold text-text-primary">{machines.length}</p><p className="text-xs text-text-muted">{t("machines.total")}</p></div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center"><Factory size={20} /></div>
          <div><p className="text-2xl font-bold text-text-primary">{activeCnt}</p><p className="text-xs text-text-muted">{t("machines.active")}</p></div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center"><Wrench size={20} /></div>
          <div><p className="text-2xl font-bold text-text-primary">{repairCnt}</p><p className="text-xs text-text-muted">{t("machines.repair")}</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border-primary rounded-xl flex-1 w-full sm:w-auto">
          <Search size={16} className="text-text-muted shrink-0" />
          <input type="text" placeholder={t("machines.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          {[["ALL", t("machines.all")], ["ACTIVE", t("machines.active")], ["UNDER_REPAIR", t("machines.under_repair")]].map(([s, label]) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30" : "bg-bg-card text-text-muted border border-border-primary hover:text-text-primary"}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-blue text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-accent-cyan/20 transition-all">
          <Plus size={16} />{t("machines.add")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((machine, idx) => (
          <div key={machine.id}
            className="group p-5 rounded-2xl bg-white border border-border-primary hover:border-accent-cyan/20 hover:shadow-md transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${idx * 0.03}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-blue/15 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-cyan">M{machine.machineNumber}</span>
              </div>
              <StatusBadge status={machine.status} />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">Machine {machine.machineNumber}</h4>
            <p className="text-xs text-text-muted mb-3">{machine.typeModel}</p>
            <div className="flex items-center justify-between pt-3 border-t border-border-primary">
              <span className="text-[10px] text-text-muted">{t("machines.added")} {new Date(machine.createdAt).toLocaleDateString()}</span>
              <button onClick={() => toggleStatus(machine.id, machine.status)} disabled={isPending} title="Toggle Status"
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-bg-secondary text-text-muted hover:text-accent-cyan transition-all disabled:opacity-50">
                <Wrench size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t("machines.add_title")}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">{t("machines.number")}</label>
            <input type="number" value={newMachineNum} onChange={(e) => setNewMachineNum(e.target.value)} placeholder="e.g. 11"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">{t("machines.type")}</label>
            <input type="text" value={newTypeModel} onChange={(e) => setNewTypeModel(e.target.value)} placeholder="e.g. Sulzer TW11"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddMachine} disabled={isPending || !newMachineNum || !newTypeModel}
              className="flex-1 flex justify-center items-center py-2.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : t("machines.add")}
            </button>
            <button onClick={() => setShowAddModal(false)} disabled={isPending}
              className="px-6 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl text-sm hover:bg-bg-card-hover transition-all">
              {t("machines.cancel")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
