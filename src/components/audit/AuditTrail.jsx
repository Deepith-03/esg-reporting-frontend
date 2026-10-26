import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { History, Search, ArrowRight, Clock, User, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const statusBadgeStyles = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    CHANGES_REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function AuditTrail({ currentUser }) {
    const [organizations, setOrganizations] = useState([]);
    const [organizationId, setOrganizationId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [periodId, setPeriodId] = useState("");
    const [auditRecords, setAuditRecords] = useState([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [loadingPeriods, setLoadingPeriods] = useState(false);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [search, setSearch] = useState("");

    // 1. Fetch Organizations
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const response = await api.get("/organizations");
                setOrganizations(response.data);
                if (response.data.length > 0) {
                    setOrganizationId(String(response.data[0].id));
                }
            } catch (err) {
                console.error("Failed to load organizations for audit trail:", err);
                toast.error("Unable to load organizations.");
            } finally {
                setLoadingOrgs(false);
            }
        };

        fetchOrgs();
    }, []);

    // 2. Fetch Reporting Periods for selected Organization
    useEffect(() => {
        setPeriodId("");
        setPeriods([]);
        setAuditRecords([]);

        if (!organizationId) return;

        const fetchPeriods = async () => {
            setLoadingPeriods(true);
            try {
                const response = await api.get(`/organizations/${organizationId}/periods`);
                setPeriods(response.data);
                if (response.data.length > 0) {
                    setPeriodId(String(response.data[0].id));
                }
            } catch (err) {
                console.error("Failed to load reporting periods for audit trail:", err);
                toast.error("Unable to load reporting periods.");
            } finally {
                setLoadingPeriods(false);
            }
        };

        fetchPeriods();
    }, [organizationId]);

    // 3. Fetch Audit History for selected Reporting Period
    useEffect(() => {
        setAuditRecords([]);
        if (!periodId) return;

        const fetchAudit = async () => {
            setLoadingAudit(true);
            try {
                const response = await api.get(`/reporting-periods/${periodId}/audit`);
                setAuditRecords(response.data);
            } catch (err) {
                console.error("Failed to load audit history:", err);
                toast.error("Unable to load audit history.");
            } finally {
                setLoadingAudit(false);
            }
        };

        fetchAudit();
    }, [periodId]);

    const selectedPeriod = periods.find((p) => String(p.id) === String(periodId));

    const filteredRecords = auditRecords.filter((rec) => {
        const query = search.toLowerCase();
        return (
            (rec.performedBy || "").toLowerCase().includes(query) ||
            (rec.previousStatus || "").toLowerCase().includes(query) ||
            (rec.newStatus || "").toLowerCase().includes(query) ||
            (rec.comment || "").toLowerCase().includes(query)
        );
    });

    const formatTimestamp = (isoString) => {
        if (!isoString) return "—";
        try {
            return new Date(isoString).toLocaleString();
        } catch {
            return isoString;
        }
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div>
                <div className="flex items-center gap-2 text-slate-800">
                    <History className="text-emerald-600" size={26} />
                    <h3 className="text-2xl font-bold">Audit Trail</h3>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                    View immutable chronological workflow status transitions and reviewer comments.
                </p>
            </div>

            {/* Selection Filters */}
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Organization
                    </label>
                    <select
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                        disabled={loadingOrgs || organizations.length === 0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                    >
                        {organizations.length === 0 ? (
                            <option value="">No organizations available</option>
                        ) : (
                            organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Reporting Period
                    </label>
                    <select
                        value={periodId}
                        onChange={(e) => setPeriodId(e.target.value)}
                        disabled={loadingPeriods || periods.length === 0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50"
                    >
                        {periods.length === 0 ? (
                            <option value="">No reporting periods found</option>
                        ) : (
                            periods.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.status?.replaceAll("_", " ")})
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {/* Search Filter and Table Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter audit records by user, status, comment..."
                            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>

                    {selectedPeriod && (
                        <div className="text-xs text-slate-500">
                            Current Period Status:{" "}
                            <span className="font-semibold text-slate-700">
                                {selectedPeriod.status?.replaceAll("_", " ")}
                            </span>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-6 py-4">Event #</th>
                                <th className="px-6 py-4">Transition</th>
                                <th className="px-6 py-4">Performed By</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Comment / Details</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loadingOrgs || loadingPeriods || loadingAudit ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        Loading audit history...
                                    </td>
                                </tr>
                            ) : !periodId ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        Please select an organization and reporting period.
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        {auditRecords.length === 0
                                            ? "No workflow audit records logged for this reporting period yet."
                                            : "No matching audit records found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/80">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            #{record.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${statusBadgeStyles[record.previousStatus] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                                                >
                                                    {record.previousStatus?.replaceAll("_", " ")}
                                                </span>
                                                <ArrowRight size={14} className="text-slate-400" />
                                                <span
                                                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${statusBadgeStyles[record.newStatus] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                                                >
                                                    {record.newStatus?.replaceAll("_", " ")}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                <User size={15} className="text-slate-400" />
                                                <span>{record.performedBy || "Unknown"}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-slate-400" />
                                                <span>{formatTimestamp(record.performedAt)}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {record.comment ? (
                                                <div className="flex items-start gap-1.5">
                                                    <FileText size={15} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span className="italic">"{record.comment}"</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AuditTrail;
