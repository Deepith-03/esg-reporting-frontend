
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import ReportingPeriodTable from "./ReportingPeriodTable";
import ReportingPeriodForm from "./ReportingPeriodForm";

function ReportingPeriods({ currentUser }) {
    const [organizations, setOrganizations] = useState([]);
    const [organizationId, setOrganizationId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(true);
    const [loadingPeriods, setLoadingPeriods] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await api.get("/organizations");
                setOrganizations(response.data);

                if (response.data.length > 0) {
                    setOrganizationId(String(response.data[0].id));
                }
            } catch (err) {
                console.error("Failed to fetch organizations:", err);
                toast.error("Unable to load organizations.");
            } finally {
                setLoadingOrganizations(false);
            }
        };

        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (!organizationId) {
            setPeriods([]);
            return;
        }

        const fetchPeriods = async () => {
            setLoadingPeriods(true);
            setError("");

            try {
                const response = await api.get(
                    `/organizations/${organizationId}/periods`
                );
                setPeriods(response.data);
            } catch (err) {
                console.error("Failed to fetch reporting periods:", err);
                setError("Unable to load reporting periods.");
            } finally {
                setLoadingPeriods(false);
            }
        };

        fetchPeriods();
    }, [organizationId]);

    const handleCreated = async () => {
        const response = await api.get(
            `/organizations/${organizationId}/periods`
        );

        setPeriods(response.data);
        setShowForm(false);
    };

    return (
        <div>
            <Toaster position="top-right" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-2xl font-bold">Reporting Periods</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage reporting periods and track their workflow status.
                    </p>
                </div>

                {["ADMIN", "DATA_ENTRY"].includes(currentUser?.role) && (
                    <button
                        onClick={() => {
                            if (!organizationId) {
                                toast.error("Register an organization first.");
                                return;
                            }

                            setShowForm(!showForm);
                        }}
                        disabled={loadingOrganizations || organizations.length === 0}
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        + Create Reporting Period
                    </button>
                )}
            </div>

            <div className="mt-6 max-w-md">
                <label className="mb-2 block text-sm font-medium">
                    Select Organization
                </label>

                <select
                    value={organizationId}
                    onChange={(e) => {
                        setOrganizationId(e.target.value);
                        setShowForm(false);
                    }}
                    disabled={loadingOrganizations || organizations.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                    {organizations.length === 0 ? (
                        <option value="">No organizations available</option>
                    ) : (
                        organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {showForm &&
                organizationId &&
                ["ADMIN", "DATA_ENTRY"].includes(currentUser?.role) && (
                    <ReportingPeriodForm
                        api={api}
                        organizationId={organizationId}
                        onCreated={handleCreated}
                        onCancel={() => setShowForm(false)}
                    />
                )}

            <ReportingPeriodTable
                periods={periods}
                loading={loadingOrganizations || loadingPeriods}
                error={error}
                currentUser={currentUser}
                onRefresh={async () => {
                    if (organizationId) {
                        const response = await api.get(
                            `/organizations/${organizationId}/periods`
                        );
                        setPeriods(response.data);
                    }
                }}
            />
        </div>
    );
}

export default ReportingPeriods;
