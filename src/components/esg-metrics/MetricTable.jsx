
function MetricTable({ metrics, loading, error }) {
    const pillarStyles = {
        ENVIRONMENTAL: "bg-emerald-100 text-emerald-700",
        SOCIAL: "bg-blue-100 text-blue-700",
        GOVERNANCE: "bg-violet-100 text-violet-700",
    };

    if (loading) {
        return <p className="mt-6 text-slate-500">Loading ESG metrics...</p>;
    }

    if (error) {
        return <p className="mt-6 text-red-600">{error}</p>;
    }

    if (metrics.length === 0) {
        return (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                No metric definitions found.
            </div>
        );
    }

    return (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-6 py-4">Metric</th>
                        <th className="px-6 py-4">Pillar</th>
                        <th className="px-6 py-4">Unit</th>
                        <th className="px-6 py-4">Description</th>
                    </tr>
                </thead>

                <tbody>
                    {metrics.map((metric) => (
                        <tr
                            key={metric.id}
                            className="border-b last:border-0 hover:bg-slate-50"
                        >
                            <td className="px-6 py-4 font-medium">
                                {metric.name || "—"}
                            </td>

                            <td className="px-6 py-4">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pillarStyles[metric.pillar] ||
                                        "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {metric.pillar || "—"}
                                </span>
                            </td>

                            <td className="px-6 py-4">{metric.unit || "—"}</td>

                            <td className="px-6 py-4 text-slate-500">
                                {metric.description || "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MetricTable;
