
import { useState } from "react";
import toast from "react-hot-toast";

function MetricEntryForm({
    api,
    periodId,
    metricDefinitions,
    onCreated,
    onCancel,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.target);

        const request = {
            metricDefinitionId: Number(formData.get("metricDefinitionId")),
            value: Number(formData.get("value")),
            dataStatus: formData.get("dataStatus"),
            dataSource: formData.get("dataSource").trim(),
            assumptions: formData.get("assumptions").trim(),
        };

        try {
            await api.post(`/periods/${periodId}/entries`, request);

            toast.success("Metric entry created successfully!");
            await onCreated();
        } catch (err) {
            console.error("Failed to create metric entry:", err);

            const message =
                err.response?.data?.message || "Failed to create metric entry.";

            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
            <h4 className="text-lg font-bold">Add Metric Entry</h4>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    ESG Metric
                </label>
                <select
                    name="metricDefinitionId"
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                    <option value="" disabled>
                        Select a metric
                    </option>
                    {metricDefinitions?.map((metric) => (
                        <option key={metric.id} value={metric.id}>
                            {metric.name} ({metric.pillar})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Value</label>
                <input
                    name="value"
                    type="number"
                    min="0"
                    step="any"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Enter measured value"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Data Status</label>
                <select
                    name="dataStatus"
                    required
                    defaultValue="ESTIMATED"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                    <option value="ACTUAL">Actual</option>
                    <option value="ESTIMATED">Estimated</option>
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Data Source</label>
                <input
                    name="dataSource"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="e.g. Utility bill, internal records"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Assumptions (Optional)
                </label>
                <textarea
                    name="assumptions"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Record any assumptions"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    {submitting ? "Saving..." : "Save Entry"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default MetricEntryForm;
