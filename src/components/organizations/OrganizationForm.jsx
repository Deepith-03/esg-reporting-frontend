import { useState } from "react";
import toast from "react-hot-toast";

function OrganizationForm({ api, onCreated, onCancel }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData(e.target);
        const organization = Object.fromEntries(formData.entries());

        try {
            await api.post("/organizations", organization);

            toast.success("Organization created successfully!");

            await onCreated();
        } catch (err) {
            console.error("Failed to create organization:", err);

            toast.error("Failed to create organization.");
            setError("Failed to create organization. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
            <h4 className="text-lg font-bold">Add Organization</h4>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Organization Name
                </label>
                <input
                    name="name"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Enter organization name"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Industry
                </label>
                <input
                    name="industry"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Enter industry"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    {submitting ? "Saving..." : "Save Organization"}
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

export default OrganizationForm;
