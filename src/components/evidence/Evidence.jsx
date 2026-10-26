import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import EvidenceTable from "./EvidenceTable";
import EvidenceUploadForm from "./EvidenceUploadForm";

const Evidence = ({ currentUser }) => {
    const [organizations, setOrganizations] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [entries, setEntries] = useState([]);
    const [evidence, setEvidence] = useState([]);

    const [organizationId, setOrganizationId] = useState("");
    const [periodId, setPeriodId] = useState("");
    const [entryId, setEntryId] = useState("");

    const [loading, setLoading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await api.get("/organizations");
                setOrganizations(response.data);
            } catch {
                toast.error("Failed to load organizations");
            }
        };

        fetchOrganizations();
    }, []);

    useEffect(() => {
        setPeriodId("");
        setEntryId("");
        setPeriods([]);
        setEntries([]);
        setEvidence([]);

        if (!organizationId) return;

        api
            .get(`/organizations/${organizationId}/periods`)
            .then((response) => setPeriods(response.data))
            .catch(() => toast.error("Failed to load reporting periods"));
    }, [organizationId]);

    useEffect(() => {
        setEntryId("");
        setEntries([]);
        setEvidence([]);

        if (!periodId) return;

        api
            .get(`/periods/${periodId}/entries`)
            .then((response) => setEntries(response.data))
            .catch(() => toast.error("Failed to load metric entries"));
    }, [periodId]);

    const fetchEvidence = async () => {
        if (!entryId) {
            setEvidence([]);
            return;
        }

        setLoading(true);

        try {
            const response = await api.get(
                `/metric-entries/${entryId}/evidence`
            );
            setEvidence(response.data);
        } catch {
            toast.error("Failed to load evidence");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setShowUploadForm(false);
        fetchEvidence();
    }, [entryId]);

    const getEntryLabel = (entry) => {
        const metricName =
            entry.metricName ||
            entry.metricDefinitionName ||
            entry.metricDefinition?.name ||
            entry.metricDefinition?.metricName;

        return metricName
            ? `${metricName} — ${entry.value ?? ""}`
            : `Entry #${entry.id} — ${entry.value ?? ""}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Evidence Management
                </h1>
                <p className="mt-1 text-gray-500">
                    Upload and review supporting documents for ESG metric entries.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 md:grid-cols-3">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Organization
                    </label>
                    <select
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                        className="w-full rounded-lg border p-2.5"
                    >
                        <option value="">Select organization</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Reporting Period
                    </label>
                    <select
                        value={periodId}
                        onChange={(e) => setPeriodId(e.target.value)}
                        disabled={!organizationId}
                        className="w-full rounded-lg border p-2.5 disabled:bg-gray-100"
                    >
                        <option value="">Select reporting period</option>
                        {periods.map((period) => (
                            <option key={period.id} value={period.id}>
                                {period.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Metric Entry
                    </label>
                    <select
                        value={entryId}
                        onChange={(e) => setEntryId(e.target.value)}
                        disabled={!periodId}
                        className="w-full rounded-lg border p-2.5 disabled:bg-gray-100"
                    >
                        <option value="">Select metric entry</option>
                        {entries.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {getEntryLabel(entry)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {entryId && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Supporting Evidence
                        </h2>

                        {["ADMIN", "DATA_ENTRY"].includes(currentUser?.role) && (<button
                            onClick={() => setShowUploadForm((previous) => !previous)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            {showUploadForm ? "Cancel Upload" : "+ Upload Evidence"}
                        </button>
                        )}
                    </div>

                    {showUploadForm &&
                        ["ADMIN", "DATA_ENTRY"].includes(currentUser?.role) && (
                            <EvidenceUploadForm
                                api={api}
                                metricEntryId={entryId}
                                onCancel={() => setShowUploadForm(false)}
                                onUploaded={async () => {
                                    setShowUploadForm(false);
                                    await fetchEvidence();
                                }}
                            />
                        )}

                    <EvidenceTable evidence={evidence} loading={loading} />
                </div>
            )}
        </div>
    );
};

export default Evidence;