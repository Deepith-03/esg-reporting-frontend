
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import MetricTable from "./MetricTable";
import MetricDefinitionForm from "./MetricDefinitionForm";

function EsgMetrics({ currentUser }) {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedPillar, setSelectedPillar] = useState("ALL");

    const fetchMetrics = useCallback(async () => {
        try {
            setError("");
            const response = await api.get("/metric-definitions");
            setMetrics(response.data);
        } catch (err) {
            console.error("Failed to fetch ESG metrics:", err);
            setError("Unable to load ESG metric definitions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const handleCreated = async () => {
        await fetchMetrics();
        setShowForm(false);
    };

    const filteredMetrics = metrics.filter((metric) => {
        const matchesPillar =
            selectedPillar === "ALL" || metric.pillar === selectedPillar;

        const searchText =
            `${metric.name || ""} ${metric.unit || ""} ${metric.description || ""}`
                .toLowerCase();

        return matchesPillar && searchText.includes(search.toLowerCase());
    });

    const pillarCounts = {
        ALL: metrics.length,
        ENVIRONMENTAL: metrics.filter(
            (metric) => metric.pillar === "ENVIRONMENTAL"
        ).length,
        SOCIAL: metrics.filter((metric) => metric.pillar === "SOCIAL").length,
        GOVERNANCE: metrics.filter(
            (metric) => metric.pillar === "GOVERNANCE"
        ).length,
    };

    return (
        <div>
            <Toaster position="top-right" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-2xl font-bold">ESG Metrics</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage metric definitions across all three ESG pillars.
                    </p>
                </div>

                {currentUser?.role === "ADMIN" && (<button
                    onClick={() => setShowForm((previous) => !previous)}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                    + Add Metric
                </button>)}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "All Metrics", value: pillarCounts.ALL },
                    { label: "Environmental", value: pillarCounts.ENVIRONMENTAL },
                    { label: "Social", value: pillarCounts.SOCIAL },
                    { label: "Governance", value: pillarCounts.GOVERNANCE },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <p className="text-sm text-slate-500">{item.label}</p>
                        <p className="mt-2 text-2xl font-bold">
                            {loading ? "..." : item.value}
                        </p>
                    </div>
                ))}
            </div>

            {showForm && (
                <MetricDefinitionForm
                    api={api}
                    onCreated={handleCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search metrics..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:max-w-md"
                />

                <select
                    value={selectedPillar}
                    onChange={(e) => setSelectedPillar(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                    <option value="ALL">All Pillars</option>
                    <option value="ENVIRONMENTAL">Environmental</option>
                    <option value="SOCIAL">Social</option>
                    <option value="GOVERNANCE">Governance</option>
                </select>
            </div>

            <MetricTable
                metrics={filteredMetrics}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default EsgMetrics;
