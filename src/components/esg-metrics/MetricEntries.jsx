
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import MetricEntryForm from "./MetricEntryForm";
import MetricEntryTable from "./MetricEntryTable.jsx";

function MetricEntries({ currentUser }) {
    console.log("METRIC ENTRIES COMPONENT RENDERED");
    const [organizations, setOrganizations] = useState([]);
    const [organizationId, setOrganizationId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [periodId, setPeriodId] = useState("");
    const [entries, setEntries] = useState([]);
    const [metricDefinitions, setMetricDefinitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [orgResponse, metricResponse] = await Promise.all([
                    api.get("/organizations"),
                    api.get("/metric-definitions"),
                ]);

                console.log("METRIC API RESPONSE:", metricResponse.data);

                setOrganizations(orgResponse.data);
                setMetricDefinitions(metricResponse.data);

                if (orgResponse.data.length > 0) {
                    setOrganizationId(String(orgResponse.data[0].id));
                }
            } catch (err) {
                console.error("Failed to load initial data:", err);
                toast.error("Unable to load organizations or metric definitions.");
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        setPeriodId("");
        setPeriods([]);
        setEntries([]);
        setShowForm(false);

        if (!organizationId) return;

        const loadPeriods = async () => {
            try {
                const response = await api.get(
                    `/organizations/${organizationId}/periods`
                );

                setPeriods(response.data);

                if (response.data.length > 0) {
                    setPeriodId(String(response.data[0].id));
                }
            } catch (err) {
                console.error("Failed to load reporting periods:", err);
                toast.error("Unable to load reporting periods.");
            }
        };

        loadPeriods();
    }, [organizationId]);

    const fetchEntries = async () => {
        if (!periodId) {
            setEntries([]);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(`/periods/${periodId}/entries`);
            setEntries(response.data);
        } catch (err) {
            console.error("Failed to load metric entries:", err);
            setError("Unable to load metric entries.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [periodId]);

    const handleCreated = async () => {
        await fetchEntries();
        setShowForm(false);
    };

    return (
        <div>
            <Toaster position="top-right" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-2xl font-bold">Metric Entries</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Record ESG values against a reporting period.
                    </p>
                </div>

                {["ADMIN", "DATA_ENTRY"].includes(currentUser?.role) && (
                    <button
                        onClick={() => {
                            if (!periodId) {
                                toast.error("Create a reporting period first.");
                                return;
                            }

                            if (metricDefinitions.length === 0) {
                                toast.error("Create a metric definition first.");
                                return;
                            }

                            setShowForm((previous) => !previous);
                        }}
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                        + Add Metric Entry
                    </button>)}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Organization
                    </label>
                    <select
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
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
                    <label className="mb-2 block text-sm font-medium">
                        Reporting Period
                    </label>
                    <select
                        value={periodId}
                        onChange={(e) => setPeriodId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                        <option value="">Select reporting period</option>
                        {periods.map((period) => (
                            <option key={period.id} value={period.id}>
                                {period.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showForm && periodId && (
                <MetricEntryForm
                    api={api}
                    periodId={periodId}
                    metricDefinitions={metricDefinitions}
                    onCreated={handleCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <MetricEntryTable
                entries={entries}
                metricDefinitions={metricDefinitions}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default MetricEntries;
