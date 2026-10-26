
import { useState } from "react";
import toast from "react-hot-toast";

function EvidenceUploadForm({ api, metricEntryId, onUploaded, onCancel }) {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file.");
            return;
        }

        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description);

        try {
            await api.post(
                `/metric-entries/${metricEntryId}/evidence`,
                formData
            );

            toast.success("Evidence uploaded successfully!");
            await onUploaded();
        } catch (err) {
            console.error("Evidence upload failed:", err);

            const message =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Failed to upload evidence.";

            setError(message);
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
            <h4 className="text-lg font-bold">Upload Evidence</h4>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Select File
                </label>
                <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                {file && (
                    <p className="mt-1 text-xs text-slate-500">
                        {file.name} · {(file.size / 1024).toFixed(1)} KB
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Description (Optional)
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Describe what this file supports"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Upload Evidence"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={uploading}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default EvidenceUploadForm;
