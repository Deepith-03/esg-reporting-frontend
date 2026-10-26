import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
    Trash2,
    AlertTriangle,
    Database,
    Building2,
    Calendar,
    FileSpreadsheet,
    FileText,
    Sparkles,
    CheckCircle2,
    ShieldAlert,
    RefreshCw,
    X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function DataManagement({ currentUser, onDataChanged }) {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState("");
    const [entries, setEntries] = useState([]);
    const [selectedEntryId, setSelectedEntryId] = useState("");
    const [evidenceList, setEvidenceList] = useState([]);

    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [loadingPeriods, setLoadingPeriods] = useState(false);
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [loadingEvidence, setLoadingEvidence] = useState(false);

    // Confirmation Modal State
    const [impactModal, setImpactModal] = useState(null); // { actionType, title, impactDto, executeFn }
    const [overrideApproved, setOverrideApproved] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const isAdmin = currentUser?.role === "ADMIN";

    // 1. Load Organizations
    const loadOrganizations = async () => {
        setLoadingOrgs(true);
        try {
            const res = await api.get("/organizations");
            setOrganizations(res.data);
            if (res.data.length > 0) {
                setSelectedOrgId(String(res.data[0].id));
            } else {
                setSelectedOrgId("");
            }
        } catch (err) {
            console.error("Failed to fetch organizations:", err);
            toast.error("Unable to load organizations.");
        } finally {
            setLoadingOrgs(false);
        }
    };

    useEffect(() => {
        loadOrganizations();
    }, []);

    // 2. Load Periods when Org changes
    useEffect(() => {
        setSelectedPeriodId("");
        setPeriods([]);
        setEntries([]);
        setSelectedEntryId("");
        setEvidenceList([]);

        if (!selectedOrgId) return;

        const loadPeriods = async () => {
            setLoadingPeriods(true);
            try {
                const res = await api.get(`/organizations/${selectedOrgId}/periods`);
                setPeriods(res.data);
                if (res.data.length > 0) {
                    setSelectedPeriodId(String(res.data[0].id));
                }
            } catch (err) {
                console.error("Failed to load periods:", err);
                toast.error("Unable to load reporting periods.");
            } finally {
                setLoadingPeriods(false);
            }
        };

        loadPeriods();
    }, [selectedOrgId]);

    // 3. Load Entries when Period changes
    useEffect(() => {
        setSelectedEntryId("");
        setEntries([]);
        setEvidenceList([]);

        if (!selectedPeriodId) return;

        const loadEntries = async () => {
            setLoadingEntries(true);
            try {
                const res = await api.get(`/periods/${selectedPeriodId}/entries`);
                setEntries(res.data);
                if (res.data.length > 0) {
                    setSelectedEntryId(String(res.data[0].id));
                }
            } catch (err) {
                console.error("Failed to load metric entries:", err);
                toast.error("Unable to load metric entries.");
            } finally {
                setLoadingEntries(false);
            }
        };

        loadEntries();
    }, [selectedPeriodId]);

    // 4. Load Evidence when Entry changes
    useEffect(() => {
        setEvidenceList([]);
        if (!selectedEntryId) return;

        const loadEvidence = async () => {
            setLoadingEvidence(true);
            try {
                const res = await api.get(`/metric-entries/${selectedEntryId}/evidence`);
                setEvidenceList(res.data);
            } catch (err) {
                console.error("Failed to load evidence:", err);
                toast.error("Unable to load evidence files.");
            } finally {
                setLoadingEvidence(false);
            }
        };

        loadEvidence();
    }, [selectedEntryId]);

    // --- PREVIEW HANDLERS ---

    const handlePreviewOrganization = async (orgId) => {
        try {
            const res = await api.get(`/admin/cleanup/preview/organizations/${orgId}`);
            setImpactModal({
                actionType: "ORGANIZATION",
                title: `Delete Organization: ${res.data.targetName}`,
                impact: res.data,
                executeFn: (override) => api.delete(`/admin/cleanup/organizations/${orgId}?allowApprovedOverride=${override}`),
                successCallback: () => {
                    loadOrganizations();
                    if (onDataChanged) onDataChanged();
                },
            });
            setOverrideApproved(false);
            setConfirmText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load impact preview.");
        }
    };

    const handlePreviewPeriod = async (periodId) => {
        try {
            const res = await api.get(`/admin/cleanup/preview/periods/${periodId}`);
            setImpactModal({
                actionType: "REPORTING_PERIOD",
                title: `Delete Reporting Period: ${res.data.targetName}`,
                impact: res.data,
                executeFn: (override) => api.delete(`/admin/cleanup/periods/${periodId}?allowApprovedOverride=${override}`),
                successCallback: async () => {
                    const resPeriods = await api.get(`/organizations/${selectedOrgId}/periods`);
                    setPeriods(resPeriods.data);
                    if (resPeriods.data.length > 0) setSelectedPeriodId(String(resPeriods.data[0].id));
                    else setSelectedPeriodId("");
                    if (onDataChanged) onDataChanged();
                },
            });
            setOverrideApproved(false);
            setConfirmText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load impact preview.");
        }
    };

    const handlePreviewMetricEntry = async (entryId) => {
        try {
            const res = await api.get(`/admin/cleanup/preview/metric-entries/${entryId}`);
            setImpactModal({
                actionType: "METRIC_ENTRY",
                title: `Delete Metric Entry: ${res.data.targetName}`,
                impact: res.data,
                executeFn: (override) => api.delete(`/admin/cleanup/metric-entries/${entryId}?allowApprovedOverride=${override}`),
                successCallback: async () => {
                    const resEntries = await api.get(`/periods/${selectedPeriodId}/entries`);
                    setEntries(resEntries.data);
                    if (resEntries.data.length > 0) setSelectedEntryId(String(resEntries.data[0].id));
                    else setSelectedEntryId("");
                    if (onDataChanged) onDataChanged();
                },
            });
            setOverrideApproved(false);
            setConfirmText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load impact preview.");
        }
    };

    const handlePreviewEvidence = async (evidenceId, fileName) => {
        try {
            const res = await api.get(`/admin/cleanup/preview/evidence/${evidenceId}`);
            setImpactModal({
                actionType: "EVIDENCE",
                title: `Delete Evidence: ${fileName}`,
                impact: res.data,
                executeFn: (override) => api.delete(`/admin/cleanup/evidence/${evidenceId}?allowApprovedOverride=${override}`),
                successCallback: async () => {
                    const resEv = await api.get(`/metric-entries/${selectedEntryId}/evidence`);
                    setEvidenceList(resEv.data);
                    if (onDataChanged) onDataChanged();
                },
            });
            setOverrideApproved(false);
            setConfirmText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load impact preview.");
        }
    };

    const handlePreviewClearDemoData = async () => {
        try {
            const res = await api.get("/admin/cleanup/preview/demo-data");
            setImpactModal({
                actionType: "DEMO_DATA",
                title: "Clear All Demo / Test Data",
                impact: res.data,
                executeFn: () => api.post("/admin/cleanup/clear-demo-data"),
                successCallback: () => {
                    loadOrganizations();
                    if (onDataChanged) onDataChanged();
                },
            });
            setOverrideApproved(false);
            setConfirmText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load demo data preview.");
        }
    };

    // --- EXECUTE DELETION ---

    const handleExecuteDeletion = async () => {
        if (!impactModal) return;

        if (confirmText.trim().toUpperCase() !== "DELETE") {
            toast.error("Please type DELETE to confirm.");
            return;
        }

        setDeleting(true);
        try {
            const response = await impactModal.executeFn(overrideApproved);
            toast.success(response.data?.message || "Data deleted successfully!");
            setImpactModal(null);
            if (impactModal.successCallback) {
                await impactModal.successCallback();
            }
        } catch (err) {
            console.error("Deletion failed:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                err.message ||
                "Failed to perform deletion.";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <ShieldAlert className="mx-auto mb-3 text-red-600" size={40} />
                <h3 className="text-xl font-bold text-red-800">Access Denied</h3>
                <p className="mt-2 text-sm text-red-600">
                    Data Management and cleanup tools are strictly restricted to system Administrators.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Toaster position="top-right" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <Database className="text-red-600" size={26} />
                        <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                            Data Cleanup & Management
                        </h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Admin-only tools to safely purge test records, remove unused resources, and manage database consistency.
                    </p>
                </div>

                <button
                    onClick={handlePreviewClearDemoData}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100"
                >
                    <Sparkles size={16} />
                    Clean Demo / Test Data
                </button>
            </div>

            {/* Quick Summary Notice */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
                    <div>
                        <p className="font-semibold text-slate-800">
                            Safety Guards Enforced
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            • Foreign key order is preserved: Evidence files and Metric Entries are purged before Reporting Periods and Organizations.<br />
                            • Workflow Audit Logs are permanently preserved and will not be destroyed.<br />
                            • Approved reports require an explicit safety override check to prevent accidental deletion of audited ESG disclosures.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Cascading Deletion Workspace */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Organizations Column */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Building2 className="text-emerald-600" size={18} />
                            <h4 className="font-bold text-slate-800">1. Organizations</h4>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {organizations.length}
                        </span>
                    </div>

                    <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {loadingOrgs ? (
                            <p className="py-6 text-center text-xs text-slate-400">Loading organizations...</p>
                        ) : organizations.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-400">No organizations found.</p>
                        ) : (
                            organizations.map((org) => {
                                const isSelected = String(org.id) === String(selectedOrgId);
                                return (
                                    <div
                                        key={org.id}
                                        onClick={() => setSelectedOrgId(String(org.id))}
                                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                                            isSelected
                                                ? "border-emerald-500 bg-emerald-50/40"
                                                : "border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {org.name}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {org.industry || "General"}
                                            </p>
                                        </div>

                                        <button
                                            title="Delete Organization"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreviewOrganization(org.id);
                                            }}
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. Reporting Periods Column */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-blue-600" size={18} />
                            <h4 className="font-bold text-slate-800">2. Reporting Periods</h4>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {periods.length}
                        </span>
                    </div>

                    <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {loadingPeriods ? (
                            <p className="py-6 text-center text-xs text-slate-400">Loading periods...</p>
                        ) : !selectedOrgId ? (
                            <p className="py-6 text-center text-xs text-slate-400">Select an organization first.</p>
                        ) : periods.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-400">No periods found for this org.</p>
                        ) : (
                            periods.map((p) => {
                                const isSelected = String(p.id) === String(selectedPeriodId);
                                const isApproved = p.status === "APPROVED";
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPeriodId(String(p.id))}
                                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                                            isSelected
                                                ? "border-blue-500 bg-blue-50/40"
                                                : "border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {p.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span
                                                    className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                                        isApproved
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {p.status}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            title="Delete Reporting Period"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreviewPeriod(p.id);
                                            }}
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 3. Metric Entries & Evidence Column */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="text-violet-600" size={18} />
                            <h4 className="font-bold text-slate-800">3. Entries & Evidence</h4>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {entries.length} Entries
                        </span>
                    </div>

                    <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {loadingEntries ? (
                            <p className="py-6 text-center text-xs text-slate-400">Loading entries...</p>
                        ) : !selectedPeriodId ? (
                            <p className="py-6 text-center text-xs text-slate-400">Select a period first.</p>
                        ) : entries.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-400">No entries recorded for this period.</p>
                        ) : (
                            entries.map((entry) => {
                                const isSelected = String(entry.id) === String(selectedEntryId);
                                const metricName =
                                    entry.metricDefinition?.name ||
                                    entry.metricName ||
                                    `Metric #${entry.metricDefinitionId || entry.id}`;
                                return (
                                    <div
                                        key={entry.id}
                                        onClick={() => setSelectedEntryId(String(entry.id))}
                                        className={`rounded-xl border p-3 transition ${
                                            isSelected
                                                ? "border-violet-500 bg-violet-50/30"
                                                : "border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {metricName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Value: <span className="font-medium text-slate-700">{entry.value}</span>
                                                </p>
                                            </div>

                                            <button
                                                title="Delete Metric Entry"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePreviewMetricEntry(entry.id);
                                                }}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Evidence Items under this entry if selected */}
                                        {isSelected && evidenceList.length > 0 && (
                                            <div className="mt-2.5 border-t border-slate-100 pt-2 space-y-1.5">
                                                <p className="text-[11px] font-semibold text-slate-500">
                                                    Supporting Files:
                                                </p>
                                                {evidenceList.map((ev) => (
                                                    <div
                                                        key={ev.id}
                                                        className="flex items-center justify-between rounded-lg bg-white p-1.5 border border-slate-200 text-xs"
                                                    >
                                                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                                            <FileText size={13} className="text-blue-500 shrink-0" />
                                                            <span className="truncate text-slate-700 font-medium">
                                                                {ev.fileName}
                                                            </span>
                                                        </div>
                                                        <button
                                                            title="Delete Evidence File"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePreviewEvidence(ev.id, ev.fileName);
                                                            }}
                                                            className="text-slate-400 hover:text-red-600 p-0.5"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Impact Analysis & Destructive Confirmation Modal */}
            {impactModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle size={22} />
                                <h4 className="text-lg font-bold text-slate-900">
                                    Confirm Destructive Deletion
                                </h4>
                            </div>
                            <button
                                onClick={() => setImpactModal(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <p className="text-sm font-semibold text-slate-800">
                                {impactModal.title}
                            </p>

                            {/* Impact Summary Metrics */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500">Orgs</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {impactModal.impact.organizationsAffected}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500">Periods</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {impactModal.impact.periodsAffected}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500">Entries</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {impactModal.impact.metricEntriesAffected}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500">Evidence</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {impactModal.impact.evidenceFilesAffected}
                                    </p>
                                </div>
                            </div>

                            {/* Audit Log Preservation Indicator */}
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <span>
                                    {impactModal.impact.auditLogsPreserved} workflow audit trail event(s) will remain safely preserved in the database.
                                </span>
                            </div>

                            {/* Detailed Children List */}
                            {impactModal.impact.details && impactModal.impact.details.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 max-h-36 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-600 mb-1">
                                        Records queued for removal:
                                    </p>
                                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                                        {impactModal.impact.details.map((d, i) => (
                                            <li key={i}>{d}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Approved Protection Guard */}
                            {impactModal.impact.approved && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 space-y-2">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <AlertTriangle size={15} className="text-red-600" />
                                        Warning: This target includes APPROVED reporting data!
                                    </p>
                                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                                        <input
                                            type="checkbox"
                                            checked={overrideApproved}
                                            onChange={(e) => setOverrideApproved(e.target.checked)}
                                            className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span>I explicitly authorize the deletion of finalized/approved ESG records.</span>
                                    </label>
                                </div>
                            )}

                            {/* Typing Confirmation Requirement */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type DELETE"
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                            <button
                                type="button"
                                onClick={() => setImpactModal(null)}
                                disabled={deleting}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteDeletion}
                                disabled={
                                    deleting ||
                                    confirmText.trim().toUpperCase() !== "DELETE" ||
                                    (impactModal.impact.approved && !overrideApproved)
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-40"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw size={15} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Permanently Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataManagement;
