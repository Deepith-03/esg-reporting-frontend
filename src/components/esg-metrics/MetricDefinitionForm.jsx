
import { useState } from "react";
import toast from "react-hot-toast";

function MetricDefinitionForm({ api, onCreated, onCancel }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.target);

        const metric = {
            name: formData.get("name").trim(),
            pillar: formData.get("pillar"),
            unit: formData.get("unit").trim(),
            description: formData.get("description").trim(),
        };

        try {
            await api.post("/metric-definitions", metric);
            toast.success("Metric definition created successfully!");
            await onCreated();
        } catch (err) {
            console.error("Failed to create metric definition:", err);
            const message =
                err.response?.data?.message || "Failed to create metric definition.";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h4 className="text-lg font-bold">Add Metric Definition</h4>

            <div>
                <label className="mb-1 block text-sm font-medium">Metric Name</label>
                <input name="name" required className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g. Electricity Consumption" />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">ESG Pillar</label>
                <select name="pillar" required defaultValue="ENVIRONMENTAL" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                    <option value="ENVIRONMENTAL">Environmental</option>
                    <option value="SOCIAL">Social</option>
                    <option value="GOVERNANCE">Governance</option>
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Unit</label>
                <input name="unit" required className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g. kWh" />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea name="description" rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Describe the metric" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    {submitting ? "Saving..." : "Save Metric"}
                </button>
                <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default MetricDefinitionForm;
