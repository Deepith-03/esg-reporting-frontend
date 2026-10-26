
import { useState } from "react";
import toast from "react-hot-toast";

function ReportingPeriodForm({ api, organizationId, onCreated, onCancel }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.target);

        const request = {
            name: formData.get("name"),
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate"),
            reportingBoundary: formData.get("reportingBoundary"),
        };

        if (request.endDate < request.startDate) {
            setError("End date cannot be before start date.");
            setSubmitting(false);
            return;
        }

        try {
            await api.post(
                `/organizations/${organizationId}/periods`,
                request
            );

            toast.success("Reporting period created successfully!");
            await onCreated();
        } catch (err) {
            console.error("Failed to create reporting period:", err);
            setError(
                err.response?.data?.message || "Failed to create reporting period."
            );
            toast.error("Failed to create reporting period.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
            <h4 className="text-lg font-bold">Create Reporting Period</h4>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Period Name
                </label>
                <input
                    name="name"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="e.g. FY 2026-27"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Start Date
                </label>
                <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    End Date
                </label>
                <input
                    type="date"
                    name="endDate"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Reporting Boundary
                </label>
                <input
                    name="reportingBoundary"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="e.g. Organization-wide"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    {submitting ? "Saving..." : "Save Reporting Period"}
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

export default ReportingPeriodForm;
