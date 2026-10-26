
import { useState } from "react";
import { Search, Send, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";

const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    CHANGES_REQUESTED: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
};

function ReportingPeriodTable({ periods, loading, error, currentUser, onRefresh }) {
    const [search, setSearch] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [commentModalPeriod, setCommentModalPeriod] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState("");

    const userRole = currentUser?.role;
    const canSubmit = ["ADMIN", "DATA_ENTRY"].includes(userRole);
    const canReview = ["ADMIN", "REVIEWER"].includes(userRole);
    const isViewer = userRole === "VIEWER";

    const filteredPeriods = periods.filter((period) =>
        `${period.name || ""} ${period.reportingBoundary || ""} ${period.status || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleWorkflowAction = async (periodId, endpoint, body = null, successMsg = "Action completed") => {
        setActionLoadingId(periodId);
        try {
            await api.post(`/reporting-periods/${periodId}/${endpoint}`, body || {});
            toast.success(successMsg);
            if (onRefresh) {
                await onRefresh();
            }
        } catch (err) {
            console.error(`Workflow action ${endpoint} failed:`, err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                err.message ||
                "Failed to process workflow action.";
            toast.error(message);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleOpenCommentModal = (period) => {
        setCommentModalPeriod(period);
        setCommentText("");
        setCommentError("");
    };

    const handleCloseCommentModal = () => {
        setCommentModalPeriod(null);
        setCommentText("");
        setCommentError("");
    };

    const handleConfirmRequestChanges = async (e) => {
        e.preventDefault();
        const trimmedComment = commentText.trim();
        if (!trimmedComment) {
            setCommentError("A comment is required when requesting changes.");
            return;
        }

        const periodId = commentModalPeriod.id;
        handleCloseCommentModal();
        await handleWorkflowAction(
            periodId,
            "request-changes",
            { comment: trimmedComment },
            "Changes requested successfully!"
        );
    };

    const renderWorkflowActions = (period) => {
        if (isViewer) {
            return <span className="text-xs text-slate-400">View only</span>;
        }

        const isBusy = actionLoadingId === period.id;

        switch (period.status) {
            case "DRAFT":
                if (canSubmit) {
                    return (
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                                handleWorkflowAction(
                                    period.id,
                                    "submit",
                                    null,
                                    "Report submitted for review!"
                                )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send size={13} />
                            {isBusy ? "Submitting..." : "Submit"}
                        </button>
                    );
                }
                return <span className="text-xs text-slate-400">Awaiting Submission</span>;

            case "SUBMITTED":
                if (canReview) {
                    return (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                    handleWorkflowAction(
                                        period.id,
                                        "approve",
                                        null,
                                        "Report approved successfully!"
                                    )
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                <CheckCircle2 size={13} />
                                {isBusy ? "Approving..." : "Approve"}
                            </button>
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleOpenCommentModal(period)}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                                <AlertCircle size={13} />
                                Request Changes
                            </button>
                        </div>
                    );
                }
                return <span className="text-xs text-slate-400">Awaiting Review</span>;

            case "CHANGES_REQUESTED":
                if (canSubmit) {
                    return (
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                                handleWorkflowAction(
                                    period.id,
                                    "resubmit",
                                    null,
                                    "Report resubmitted for review!"
                                )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <RotateCcw size={13} />
                            {isBusy ? "Resubmitting..." : "Resubmit"}
                        </button>
                    );
                }
                return <span className="text-xs text-slate-400">Needs Changes</span>;

            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 size={14} /> Completed
                    </span>
                );

            default:
                return <span className="text-xs text-slate-400">—</span>;
        }
    };

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
                <div className="relative max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reporting periods..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-6 py-4">Period</th>
                            <th className="px-6 py-4">Start Date</th>
                            <th className="px-6 py-4">End Date</th>
                            <th className="px-6 py-4">Reporting Boundary</th>
                            <th className="px-6 py-4">Status</th>
                            {!isViewer && <th className="px-6 py-4">Workflow Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={isViewer ? 5 : 6} className="px-6 py-8 text-center">
                                    Loading reporting periods...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={isViewer ? 5 : 6} className="px-6 py-8 text-center text-red-600">
                                    {error}
                                </td>
                            </tr>
                        ) : filteredPeriods.length === 0 ? (
                            <tr>
                                <td colSpan={isViewer ? 5 : 6} className="px-6 py-8 text-center text-slate-500">
                                    {periods.length === 0
                                        ? "No reporting periods found."
                                        : "No matching reporting periods found."}
                                </td>
                            </tr>
                        ) : (
                            filteredPeriods.map((period) => (
                                <tr
                                    key={period.id}
                                    className="border-b last:border-0 hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {period.name}
                                    </td>
                                    <td className="px-6 py-4">{period.startDate}</td>
                                    <td className="px-6 py-4">{period.endDate}</td>
                                    <td className="px-6 py-4">
                                        {period.reportingBoundary}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[period.status] ||
                                                "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {(period.status || "UNKNOWN").replaceAll("_", " ")}
                                        </span>
                                    </td>
                                    {!isViewer && (
                                        <td className="px-6 py-4">
                                            {renderWorkflowActions(period)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {commentModalPeriod && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle size={22} />
                            <h4 className="text-lg font-bold text-slate-800">Request Changes</h4>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Provide comments detailing the required revisions for{" "}
                            <span className="font-semibold text-slate-700">
                                {commentModalPeriod.name}
                            </span>
                            .
                        </p>

                        <form onSubmit={handleConfirmRequestChanges} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Reviewer Comment <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={commentText}
                                    onChange={(e) => {
                                        setCommentText(e.target.value);
                                        if (commentError) setCommentError("");
                                    }}
                                    placeholder="Explain what needs to be updated before approval..."
                                    className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    autoFocus
                                />
                                {commentError && (
                                    <p className="mt-1 text-xs font-medium text-red-600">
                                        {commentError}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseCommentModal}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportingPeriodTable;
