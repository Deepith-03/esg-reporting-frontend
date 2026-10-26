import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import {
    Calculator,
    Zap,
    Flame,
    Car,
    Plus,
    Trash2,
    RefreshCw,
    Save,
    History,
    BookOpen,
    Layers,
    AlertCircle,
    Lock,
    Building2,
    Calendar,
    Eye,
    X,
    Sparkles
} from "lucide-react";

const INITIAL_FUEL_ROW = { fuelType: "DIESEL", quantity: "", unit: "LITERS" };
const INITIAL_TRANSPORT_ROW = { transportType: "PASSENGER_CAR_PETROL", distance: "", unit: "KM" };

export default function CarbonCalculator({ currentUser }) {
    const [activeTab, setActiveTab] = useState("calculator"); // "calculator" | "history" | "factors" | "api"

    // Organizations & Periods
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState("");

    // Factors & Provider Status
    const [factors, setFactors] = useState([]);
    const [providerStatus, setProviderStatus] = useState(null);

    // Calculator Inputs
    const [electricityKwh, setElectricityKwh] = useState("");
    const [fuelRows, setFuelRows] = useState([ { ...INITIAL_FUEL_ROW } ]);
    const [transportRows, setTransportRows] = useState([ { ...INITIAL_TRANSPORT_ROW } ]);

    // Unit display toggle (kg vs tonnes)
    const [displayUnit, setDisplayUnit] = useState("tonnes"); // "kg" | "tonnes"

    // Calculation State
    const [calculating, setCalculating] = useState(false);
    const [calculationResult, setCalculationResult] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Save Calculation State
    const [saveTitle, setSaveTitle] = useState("");
    const [saveNotes, setSaveNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    // History State
    const [historyList, setHistoryList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyFilterOrg, setHistoryFilterOrg] = useState("");
    const [historyFilterPeriod, setHistoryFilterPeriod] = useState("");
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const canSave = ["ADMIN", "DATA_ENTRY"].includes(currentUser?.role);
    const isAdmin = currentUser?.role === "ADMIN";

    // 1. Initial Data Fetch
    useEffect(() => {
        let isMounted = true;
        const fetchInitial = async () => {
            try {
                const [orgRes, factorsRes, statusRes] = await Promise.all([
                    api.get("/organizations"),
                    api.get("/carbon-calculator/factors"),
                    api.get("/carbon-calculator/provider-status")
                ]);
                if (!isMounted) return;
                setOrganizations(orgRes.data);
                if (orgRes.data.length > 0) {
                    setSelectedOrgId(String(orgRes.data[0].id));
                }
                setFactors(factorsRes.data);
                setProviderStatus(statusRes.data);
            } catch (err) {
                console.error("Failed to load initial calculator metadata:", err);
            }
        };
        fetchInitial();
        return () => { isMounted = false; };
    }, []);

    // 2. Load Periods when Org changes
    useEffect(() => {
        let isMounted = true;
        if (!selectedOrgId) {
            return;
        }
        const loadPeriods = async () => {
            try {
                const res = await api.get(`/organizations/${selectedOrgId}/periods`);
                if (!isMounted) return;
                setPeriods(res.data);
                if (res.data.length > 0) {
                    setSelectedPeriodId(String(res.data[0].id));
                } else {
                    setSelectedPeriodId("");
                }
            } catch (err) {
                console.error("Failed to load reporting periods:", err);
                if (isMounted) {
                    setPeriods([]);
                    setSelectedPeriodId("");
                }
            }
        };
        loadPeriods();
        return () => { isMounted = false; };
    }, [selectedOrgId]);

    // 3. Load History
    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const params = {};
            if (historyFilterOrg) params.organizationId = historyFilterOrg;
            if (historyFilterPeriod) params.reportingPeriodId = historyFilterPeriod;

            const res = await api.get("/carbon-calculator/history", { params });
            setHistoryList(res.data);
        } catch (err) {
            console.error("Failed to load calculation history:", err);
            toast.error("Unable to load calculation history.");
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (activeTab === "history") {
            const fetchHistory = async () => {
                try {
                    const params = {};
                    if (historyFilterOrg) params.organizationId = historyFilterOrg;
                    if (historyFilterPeriod) params.reportingPeriodId = historyFilterPeriod;

                    const res = await api.get("/carbon-calculator/history", { params });
                    if (!isMounted) return;
                    setHistoryList(res.data);
                } catch (err) {
                    console.error("Failed to load calculation history:", err);
                } finally {
                    if (isMounted) setLoadingHistory(false);
                }
            };
            fetchHistory();
        }
        return () => { isMounted = false; };
    }, [activeTab, historyFilterOrg, historyFilterPeriod]);

    // Fuel row actions
    const addFuelRow = () => {
        setFuelRows((prev) => [...prev, { ...INITIAL_FUEL_ROW }]);
    };

    const updateFuelRow = (index, field, value) => {
        setFuelRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            if (field === "fuelType") {
                if (value === "NATURAL_GAS") updated[index].unit = "KWH";
                else if (value === "LPG" || value === "DIESEL" || value === "PETROL" || value === "HEAVY_FUEL_OIL") updated[index].unit = "LITERS";
            }
            return updated;
        });
    };

    const removeFuelRow = (index) => {
        setFuelRows((prev) => prev.filter((_, i) => i !== index));
    };

    // Transport row actions
    const addTransportRow = () => {
        setTransportRows((prev) => [...prev, { ...INITIAL_TRANSPORT_ROW }]);
    };

    const updateTransportRow = (index, field, value) => {
        setTransportRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const removeTransportRow = (index) => {
        setTransportRows((prev) => prev.filter((_, i) => i !== index));
    };

    // Input Validation
    const validateInputs = () => {
        const errors = {};
        const parsedElectricity = electricityKwh !== "" ? Number(electricityKwh) : 0;

        if (electricityKwh !== "" && (isNaN(parsedElectricity) || parsedElectricity < 0)) {
            errors.electricity = "Electricity must be a non-negative number";
        }

        let validFuelCount = 0;
        fuelRows.forEach((row, i) => {
            if (row.quantity !== "") {
                const qty = Number(row.quantity);
                if (isNaN(qty) || qty < 0) {
                    errors[`fuel_${i}`] = "Quantity must be non-negative";
                } else if (qty > 0) {
                    validFuelCount++;
                }
            }
        });

        let validTransportCount = 0;
        transportRows.forEach((row, i) => {
            if (row.distance !== "") {
                const dist = Number(row.distance);
                if (isNaN(dist) || dist < 0) {
                    errors[`transport_${i}`] = "Distance must be non-negative";
                } else if (dist > 0) {
                    validTransportCount++;
                }
            }
        });

        if (parsedElectricity <= 0 && validFuelCount === 0 && validTransportCount === 0) {
            errors.general = "Please enter at least one consumption or transport activity greater than zero.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Pre-fill realistic sample activity
    const loadSampleData = () => {
        setElectricityKwh("12500");
        setFuelRows([
            { fuelType: "DIESEL", quantity: "450", unit: "LITERS" },
            { fuelType: "NATURAL_GAS", quantity: "3200", unit: "KWH" }
        ]);
        setTransportRows([
            { transportType: "PASSENGER_CAR_PETROL", distance: "1850", unit: "KM" },
            { transportType: "VAN_LIGHT_COMMERCIAL", distance: "920", unit: "KM" }
        ]);
        setSaveTitle("Q1 Operations & Facility Footprint");
        setSaveNotes("Calculated using sample factors from utility bills and vehicle logs.");
        setFormErrors({});
        toast.success("Loaded sample operational activity data.");
    };

    const resetForm = () => {
        setElectricityKwh("");
        setFuelRows([ { ...INITIAL_FUEL_ROW } ]);
        setTransportRows([ { ...INITIAL_TRANSPORT_ROW } ]);
        setCalculationResult(null);
        setFormErrors({});
        setSaveTitle("");
        setSaveNotes("");
    };

    // Handle Calculate
    const handleCalculate = async (e) => {
        if (e) e.preventDefault();
        if (!validateInputs()) {
            toast.error("Please correct the form errors before calculating.");
            return;
        }

        setCalculating(true);
        try {
            const payload = {
                electricityKwh: electricityKwh !== "" ? Number(electricityKwh) : 0,
                fuelEntries: fuelRows
                    .filter((r) => r.quantity !== "" && Number(r.quantity) > 0)
                    .map((r) => ({
                        fuelType: r.fuelType,
                        quantity: Number(r.quantity),
                        unit: r.unit
                    })),
                transportEntries: transportRows
                    .filter((r) => r.distance !== "" && Number(r.distance) > 0)
                    .map((r) => ({
                        transportType: r.transportType,
                        distance: Number(r.distance),
                        unit: r.unit
                    }))
            };

            const res = await api.post("/carbon-calculator/calculate", payload);
            setCalculationResult(res.data);
            if (!saveTitle) {
                const orgName = organizations.find((o) => String(o.id) === String(selectedOrgId))?.name || "Organization";
                setSaveTitle(`${orgName} Carbon Footprint - ${new Date().toLocaleDateString()}`);
            }
            toast.success("Emissions calculated successfully!");
        } catch (err) {
            console.error("Calculation failed:", err);
            const msg = err.response?.data?.message || "Failed to calculate emissions. Please check your inputs.";
            toast.error(msg);
        } finally {
            setCalculating(false);
        }
    };

    // Handle Save to MySQL
    const handleSave = async () => {
        if (!canSave) {
            toast.error("Only DATA_ENTRY and ADMIN roles can persist carbon calculations.");
            return;
        }

        if (!selectedOrgId) {
            toast.error("Please select an organization to associate this calculation with.");
            return;
        }

        if (!saveTitle || saveTitle.trim() === "") {
            toast.error("Please provide a title for this calculation record.");
            return;
        }

        if (!calculationResult) {
            toast.error("Please perform a calculation first.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                organizationId: Number(selectedOrgId),
                reportingPeriodId: selectedPeriodId ? Number(selectedPeriodId) : null,
                title: saveTitle.trim(),
                notes: saveNotes.trim(),
                calculationRequest: {
                    electricityKwh: electricityKwh !== "" ? Number(electricityKwh) : 0,
                    fuelEntries: fuelRows
                        .filter((r) => r.quantity !== "" && Number(r.quantity) > 0)
                        .map((r) => ({
                            fuelType: r.fuelType,
                            quantity: Number(r.quantity),
                            unit: r.unit
                        })),
                    transportEntries: transportRows
                        .filter((r) => r.distance !== "" && Number(r.distance) > 0)
                        .map((r) => ({
                            transportType: r.transportType,
                            distance: Number(r.distance),
                            unit: r.unit
                        }))
                }
            };

            await api.post("/carbon-calculator/save", payload);
            toast.success("Carbon calculation saved and linked to organization successfully!");
            setShowSaveModal(false);
            loadHistory();
        } catch (err) {
            console.error("Failed to save calculation:", err);
            const msg = err.response?.data?.message || "Failed to save calculation.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // Handle Delete History Item
    const handleDeleteHistory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this saved carbon calculation record?")) {
            return;
        }
        setDeletingId(id);
        try {
            await api.delete(`/carbon-calculator/history/${id}`);
            toast.success("Calculation record deleted successfully.");
            setHistoryList((prev) => prev.filter((item) => item.id !== id));
            if (selectedHistoryItem?.id === id) {
                setSelectedHistoryItem(null);
            }
        } catch (err) {
            console.error("Failed to delete record:", err);
            toast.error("Failed to delete record. Only ADMIN users can delete records.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header & Sub-Navigation */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                                Carbon Emission Calculator
                            </h3>
                            <p className="text-sm text-slate-500">
                                Estimate Scope 1, 2 & 3 greenhouse gas emissions using transparent emission factors
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab("calculator")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                            activeTab === "calculator"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Calculator size={15} />
                        Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                            activeTab === "history"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <History size={15} />
                        Saved Calculations
                        {historyList.length > 0 && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                {historyList.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("factors")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                            activeTab === "factors"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <BookOpen size={15} />
                        Emission Factors
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {factors.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("api")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                            activeTab === "api"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Layers size={15} />
                        Provider & Architecture
                    </button>
                </div>
            </div>

            {/* Dev Mode / Sample Factors Notice Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-xs">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19} />
                    <div className="flex-1 text-xs leading-relaxed sm:text-sm">
                        <span className="font-bold">Sample Factors / Development Calculation Active: </span>
                        Emissions are estimated using clearly labelled sample reference factors (sourced from UK DESNZ and US EPA indicative averages).
                        These are transparent reference values for development and testing. External certified APIs can be plugged into this service via backend configuration without altering the UI.
                    </div>
                    <div className="shrink-0">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                            Sample Dev Mode
                        </span>
                    </div>
                </div>
            </div>

            {/* TAB 1: CALCULATOR */}
            {activeTab === "calculator" && (
                <div className="space-y-6">
                    {/* Organization & Period Selector Bar */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                Target Entity Context
                            </h4>
                            <button
                                type="button"
                                onClick={loadSampleData}
                                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                                <Sparkles size={14} />
                                Load Sample Activity Data
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <Building2 size={14} className="text-slate-400" />
                                    Organization <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedOrgId}
                                    onChange={(e) => setSelectedOrgId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="">Select Organization</option>
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.industry})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <Calendar size={14} className="text-slate-400" />
                                    Reporting Period (Optional)
                                </label>
                                <select
                                    value={selectedPeriodId}
                                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="">Standalone / Unassigned Period</option>
                                    {periods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name} [{period.status}]
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Main Two-Column Layout: Inputs on Left, Results on Right */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* LEFT COLUMN: Input Form (5 cols) */}
                        <div className="space-y-6 lg:col-span-5">
                            <form onSubmit={handleCalculate} className="space-y-5">
                                {/* SECTION 1: Electricity */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
                                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">
                                                Electricity Consumption
                                            </h4>
                                            <p className="text-[11px] text-slate-500">
                                                Scope 2 Indirect - Grid electric usage
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                                            Total Electricity in Kilowatt-Hours (kWh)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={electricityKwh}
                                                onChange={(e) => {
                                                    setElectricityKwh(e.target.value);
                                                    setFormErrors((prev) => ({ ...prev, electricity: undefined, general: undefined }));
                                                }}
                                                placeholder="e.g. 5000"
                                                className={`w-full rounded-xl border ${
                                                    formErrors.electricity ? "border-red-400 bg-red-50/30" : "border-slate-300 bg-white"
                                                } px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none`}
                                            />
                                            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-semibold text-slate-400">
                                                kWh
                                            </span>
                                        </div>
                                        {formErrors.electricity && (
                                            <p className="mt-1 text-xs text-red-600">{formErrors.electricity}</p>
                                        )}
                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            Reference factor: 0.420000 kg CO2e / kWh
                                        </p>
                                    </div>
                                </div>

                                {/* SECTION 2: Fuel Consumption */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                                                <Flame size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    Fuel Consumption
                                                </h4>
                                                <p className="text-[11px] text-slate-500">
                                                    Scope 1 Direct - Stationary & fleet combustion
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addFuelRow}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            <Plus size={13} /> Add Fuel
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {fuelRows.map((row, index) => (
                                            <div
                                                key={index}
                                                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                                            >
                                                <div className="flex items-center justify-between pb-2">
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        Fuel #{index + 1}
                                                    </span>
                                                    {fuelRows.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFuelRow(index)}
                                                            className="text-slate-400 hover:text-red-500"
                                                            title="Remove fuel row"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid gap-2 sm:grid-cols-12">
                                                    <div className="sm:col-span-5">
                                                        <select
                                                            value={row.fuelType}
                                                            onChange={(e) => updateFuelRow(index, "fuelType", e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                                        >
                                                            <option value="DIESEL">Diesel Fuel</option>
                                                            <option value="PETROL">Petrol / Gasoline</option>
                                                            <option value="NATURAL_GAS">Natural Gas</option>
                                                            <option value="LPG">LPG (Propane)</option>
                                                            <option value="HEAVY_FUEL_OIL">Heavy Fuel Oil</option>
                                                        </select>
                                                    </div>

                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            placeholder="Quantity"
                                                            value={row.quantity}
                                                            onChange={(e) => updateFuelRow(index, "quantity", e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-3">
                                                        <select
                                                            value={row.unit}
                                                            onChange={(e) => updateFuelRow(index, "unit", e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                                        >
                                                            {row.fuelType === "NATURAL_GAS" ? (
                                                                <>
                                                                    <option value="KWH">kWh</option>
                                                                    <option value="M3">m³</option>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <option value="LITERS">Liters</option>
                                                                    <option value="GALLONS">Gallons</option>
                                                                    {row.fuelType === "LPG" && <option value="KG">kg</option>}
                                                                </>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                                {formErrors[`fuel_${index}`] && (
                                                    <p className="mt-1 text-xs text-red-600">{formErrors[`fuel_${index}`]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTION 3: Transportation Activity */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                                <Car size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    Transportation Activity
                                                </h4>
                                                <p className="text-[11px] text-slate-500">
                                                    Scope 3 / Scope 1 - Travel & freight logistics
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addTransportRow}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            <Plus size={13} /> Add Transport
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {transportRows.map((row, index) => (
                                            <div
                                                key={index}
                                                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                                            >
                                                <div className="flex items-center justify-between pb-2">
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        Transport Activity #{index + 1}
                                                    </span>
                                                    {transportRows.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTransportRow(index)}
                                                            className="text-slate-400 hover:text-red-500"
                                                            title="Remove transport row"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid gap-2 sm:grid-cols-12">
                                                    <div className="sm:col-span-6">
                                                        <select
                                                            value={row.transportType}
                                                            onChange={(e) => updateTransportRow(index, "transportType", e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                                        >
                                                            <option value="PASSENGER_CAR_PETROL">Passenger Car (Petrol)</option>
                                                            <option value="PASSENGER_CAR_DIESEL">Passenger Car (Diesel)</option>
                                                            <option value="ELECTRIC_VEHICLE">Electric Vehicle (EV)</option>
                                                            <option value="VAN_LIGHT_COMMERCIAL">Light Commercial Van</option>
                                                            <option value="HEAVY_TRUCK_FREIGHT">Heavy Freight Truck (HGV)</option>
                                                            <option value="RAIL_TRAIN">Rail / Passenger Train</option>
                                                            <option value="AIR_DOMESTIC">Flight (Domestic)</option>
                                                            <option value="AIR_INTERNATIONAL">Flight (International)</option>
                                                        </select>
                                                    </div>

                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            placeholder="Distance"
                                                            value={row.distance}
                                                            onChange={(e) => updateTransportRow(index, "distance", e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <select
                                                            value={row.unit}
                                                            onChange={(e) => updateTransportRow(index, "unit", e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                                        >
                                                            <option value="KM">km</option>
                                                            <option value="MILES">miles</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {formErrors[`transport_${index}`] && (
                                                    <p className="mt-1 text-xs text-red-600">{formErrors[`transport_${index}`]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {formErrors.general && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                                        {formErrors.general}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={calculating}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {calculating ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={17} />
                                                Calculating...
                                            </>
                                        ) : (
                                            <>
                                                <Calculator size={17} />
                                                Calculate Emissions
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: Calculation Results (7 cols) */}
                        <div className="space-y-6 lg:col-span-7">
                            {!calculationResult ? (
                                <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <Calculator size={32} />
                                    </div>
                                    <h4 className="mt-4 text-lg font-bold text-slate-800">
                                        No Calculations Performed Yet
                                    </h4>
                                    <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
                                        Fill in your electricity consumption, fuel usage, and transport activity on the left and click <strong>Calculate Emissions</strong> to generate a complete Scope 1, 2, and 3 emission profile with full mathematical transparency.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={loadSampleData}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                                    >
                                        <Sparkles size={15} />
                                        Fill With Sample Data to Preview
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Overall Results Card */}
                                    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 p-6 shadow-sm">
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                                    Estimated Total Footprint
                                                </span>
                                                <div className="mt-1 flex items-baseline gap-2">
                                                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                                                        {displayUnit === "tonnes"
                                                            ? Number(calculationResult.totalEmissionsTonnes).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                                                            : Number(calculationResult.totalEmissionsKg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-base font-bold text-slate-500">
                                                        {displayUnit === "tonnes" ? "t CO2e (Tonnes)" : "kg CO2e"}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Carbon Dioxide Equivalent ({displayUnit === "tonnes"
                                                        ? `${Number(calculationResult.totalEmissionsKg).toLocaleString()} kg CO2e`
                                                        : `${Number(calculationResult.totalEmissionsTonnes).toLocaleString()} tonnes CO2e`})
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Unit switch */}
                                                <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDisplayUnit("tonnes")}
                                                        className={`rounded-md px-2.5 py-1 transition ${
                                                            displayUnit === "tonnes" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        Tonnes (t)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDisplayUnit("kg")}
                                                        className={`rounded-md px-2.5 py-1 transition ${
                                                            displayUnit === "kg" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        Kilograms (kg)
                                                    </button>
                                                </div>

                                                {/* Save button */}
                                                {canSave ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSaveModal(true)}
                                                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                                                    >
                                                        <Save size={15} /> Save Record
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500" title="Saving requires DATA_ENTRY or ADMIN role">
                                                        <Lock size={13} /> View Only
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Scope Proportion Stacked Bar */}
                                        <div className="mt-6">
                                            <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                                                <span className="text-slate-600">GHG Scope Breakdown</span>
                                                <span className="text-slate-400">100% of Total</span>
                                            </div>
                                            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                {Number(calculationResult.scope1Percentage) > 0 && (
                                                    <div
                                                        style={{ width: `${calculationResult.scope1Percentage}%` }}
                                                        className="bg-rose-500 transition-all"
                                                        title={`Scope 1: ${calculationResult.scope1Percentage}%`}
                                                    />
                                                )}
                                                {Number(calculationResult.scope2Percentage) > 0 && (
                                                    <div
                                                        style={{ width: `${calculationResult.scope2Percentage}%` }}
                                                        className="bg-amber-500 transition-all"
                                                        title={`Scope 2: ${calculationResult.scope2Percentage}%`}
                                                    />
                                                )}
                                                {Number(calculationResult.scope3Percentage) > 0 && (
                                                    <div
                                                        style={{ width: `${calculationResult.scope3Percentage}%` }}
                                                        className="bg-blue-500 transition-all"
                                                        title={`Scope 3: ${calculationResult.scope3Percentage}%`}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* 3 Scope Cards */}
                                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                                    <span className="text-xs font-bold text-rose-950">Scope 1 (Direct)</span>
                                                </div>
                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                    {displayUnit === "tonnes"
                                                        ? `${calculationResult.scope1EmissionsTonnes} t`
                                                        : `${Number(calculationResult.scope1EmissionsKg).toLocaleString()} kg`}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {calculationResult.scope1Percentage}% · Fuel combustion
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                    <span className="text-xs font-bold text-amber-950">Scope 2 (Indirect)</span>
                                                </div>
                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                    {displayUnit === "tonnes"
                                                        ? `${calculationResult.scope2EmissionsTonnes} t`
                                                        : `${Number(calculationResult.scope2EmissionsKg).toLocaleString()} kg`}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {calculationResult.scope2Percentage}% · Purchased electricity
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                                    <span className="text-xs font-bold text-blue-950">Scope 3 (Activity)</span>
                                                </div>
                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                    {displayUnit === "tonnes"
                                                        ? `${calculationResult.scope3EmissionsTonnes} t`
                                                        : `${Number(calculationResult.scope3EmissionsKg).toLocaleString()} kg`}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {calculationResult.scope3Percentage}% · Travel & transport
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itemized Calculation Breakdown & Mathematical Formulas */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div>
                                                <h4 className="text-base font-bold text-slate-900">
                                                    Calculation Audit & Factor Transparency
                                                </h4>
                                                <p className="text-xs text-slate-500">
                                                    Explicit formulas and reference factors used for every calculated input line
                                                </p>
                                            </div>
                                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                                                Deterministic Math
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Electricity Item */}
                                            {calculationResult.electricity && Number(calculationResult.electricity.kwh) > 0 && (
                                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Zap size={16} className="text-amber-500" />
                                                            <span className="text-xs font-bold text-slate-900">Purchased Grid Electricity</span>
                                                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                                                Scope 2
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {Number(calculationResult.electricity.emissionsKg).toLocaleString()} kg CO2e
                                                            <span className="ml-1 text-[11px] font-normal text-slate-500">
                                                                ({calculationResult.electricity.emissionsTonnes} t)
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-700">
                                                        {calculationResult.electricity.formula}
                                                    </div>

                                                    <p className="mt-1.5 text-[11px] text-slate-500">
                                                        <span className="font-semibold">Factor Citation: </span>
                                                        {calculationResult.electricity.factorSource}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Fuel Items */}
                                            {calculationResult.fuelItems?.map((item, idx) => (
                                                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Flame size={16} className="text-rose-500" />
                                                            <span className="text-xs font-bold text-slate-900">{item.fuelLabel}</span>
                                                            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">
                                                                Scope 1
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {Number(item.emissionsKg).toLocaleString()} kg CO2e
                                                            <span className="ml-1 text-[11px] font-normal text-slate-500">
                                                                ({item.emissionsTonnes} t)
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-700">
                                                        {item.formula}
                                                    </div>

                                                    <p className="mt-1.5 text-[11px] text-slate-500">
                                                        <span className="font-semibold">Factor Citation: </span>
                                                        {item.factorSource}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Transport Items */}
                                            {calculationResult.transportItems?.map((item, idx) => (
                                                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Car size={16} className="text-blue-500" />
                                                            <span className="text-xs font-bold text-slate-900">{item.transportLabel}</span>
                                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                                                                Scope 3
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {Number(item.emissionsKg).toLocaleString()} kg CO2e
                                                            <span className="ml-1 text-[11px] font-normal text-slate-500">
                                                                ({item.emissionsTonnes} t)
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-700">
                                                        {item.formula}
                                                    </div>

                                                    <p className="mt-1.5 text-[11px] text-slate-500">
                                                        <span className="font-semibold">Factor Citation: </span>
                                                        {item.factorSource}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SAVED CALCULATION HISTORY */}
            {activeTab === "history" && (
                <div className="space-y-5">
                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-slate-400" />
                                <select
                                    value={historyFilterOrg}
                                    onChange={(e) => setHistoryFilterOrg(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium"
                                >
                                    <option value="">All Organizations</option>
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>
                                            {org.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                <select
                                    value={historyFilterPeriod}
                                    onChange={(e) => setHistoryFilterPeriod(e.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium"
                                >
                                    <option value="">All Reporting Periods</option>
                                    {periods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={loadHistory}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <RefreshCw size={13} className={loadingHistory ? "animate-spin" : ""} />
                                Refresh History
                            </button>
                        </div>

                        <span className="text-xs text-slate-500">
                            Showing <strong>{historyList.length}</strong> saved calculations
                        </span>
                    </div>

                    {/* History Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                        {loadingHistory ? (
                            <div className="py-12 text-center text-sm text-slate-500">
                                <RefreshCw className="mx-auto mb-2 animate-spin text-emerald-600" size={24} />
                                Loading calculation records from database...
                            </div>
                        ) : historyList.length === 0 ? (
                            <div className="py-12 text-center text-sm text-slate-500">
                                No carbon calculations saved yet. Run a calculation and click "Save Record" to store it.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Title</th>
                                            <th className="px-4 py-3 font-semibold">Organization</th>
                                            <th className="px-4 py-3 font-semibold">Period</th>
                                            <th className="px-4 py-3 font-semibold">Total (Tonnes)</th>
                                            <th className="px-4 py-3 font-semibold">Scopes (1 / 2 / 3)</th>
                                            <th className="px-4 py-3 font-semibold">Date & Author</th>
                                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historyList.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                <td className="px-4 py-3.5 font-bold text-slate-900">
                                                    {item.title}
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-600">
                                                    {item.organizationName}
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-600">
                                                    {item.reportingPeriodName ? (
                                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                                            {item.reportingPeriodName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 font-extrabold text-slate-900">
                                                    {Number(item.totalEmissionsTonnes).toFixed(4)} t CO2e
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5 text-[11px]">
                                                        <span className="text-rose-600 font-semibold" title="Scope 1">{Number(item.scope1EmissionsKg).toFixed(0)} kg</span>
                                                        <span className="text-slate-300">/</span>
                                                        <span className="text-amber-600 font-semibold" title="Scope 2">{Number(item.scope2EmissionsKg).toFixed(0)} kg</span>
                                                        <span className="text-slate-300">/</span>
                                                        <span className="text-blue-600 font-semibold" title="Scope 3">{Number(item.scope3EmissionsKg).toFixed(0)} kg</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-500">
                                                    <div>{new Date(item.calculatedAt).toLocaleDateString()}</div>
                                                    <div className="text-[10px] text-slate-400">by @{item.createdBy}</div>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedHistoryItem(item)}
                                                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                        >
                                                            <Eye size={13} /> View
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteHistory(item.id)}
                                                                disabled={deletingId === item.id}
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                                title="Delete calculation (Admin only)"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: TRANSPARENT EMISSION FACTORS LIBRARY */}
            {activeTab === "factors" && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="mb-4">
                            <h4 className="text-base font-bold text-slate-900">
                                Configurable Reference Emission Factors
                            </h4>
                            <p className="text-xs text-slate-500">
                                Explicit sample emission factors currently configured in the backend calculation engine. Sources are documented and verifiable.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Category</th>
                                        <th className="px-4 py-3 font-semibold">Activity / Source</th>
                                        <th className="px-4 py-3 font-semibold">Scope</th>
                                        <th className="px-4 py-3 font-semibold">Factor (kg CO2e / unit)</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Source Citation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {factors.map((f, i) => (
                                        <tr key={i} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {f.category}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-900">
                                                {f.displayName}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                                    f.scope === "SCOPE_1" ? "bg-rose-100 text-rose-800" :
                                                    f.scope === "SCOPE_2" ? "bg-amber-100 text-amber-800" :
                                                    "bg-blue-100 text-blue-800"
                                                }`}>
                                                    {f.scope.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                {f.factorKgCo2ePerUnit} <span className="font-normal text-slate-500">{f.factorUnit}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                                    Sample Factor
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {f.sourceCitation}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: PROVIDER & ARCHITECTURE STATUS */}
            {activeTab === "api" && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">
                                    Backend Calculation Provider & API Architecture
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Design specification for enterprise external API integration
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Active Provider
                                </span>
                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {providerStatus?.providerDisplayName || "Sample Local Carbon Calculator"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Identifier: <code className="bg-slate-200 px-1 py-0.5 rounded">{providerStatus?.providerId}</code>
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    External API Status
                                </span>
                                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900">
                                    <span className={`h-2.5 w-2.5 rounded-full ${providerStatus?.isExternalApiConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
                                    {providerStatus?.isExternalApiConfigured ? "Configured & Active" : "Sample/Local Engine Active"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Credentials read from environment variables: <code className="bg-slate-200 px-1 py-0.5 rounded">CARBON_CALCULATOR_API_KEY</code>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                            <h5 className="font-bold text-slate-900">Extensibility & Integration Design:</h5>
                            <p>
                                The backend calculation module is decoupled behind the <code>CarbonCalculationProvider</code> interface.
                                UI components consume standard, provider-agnostic DTOs (<code>CarbonCalculationRequest</code> and <code>CarbonCalculationResponse</code>).
                            </p>
                            <p>
                                When official vendor API documentation (e.g., Climatiq, Carbon Interface, or custom government emission databases) is provided:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                <li>Set <code>CARBON_CALCULATOR_API_KEY</code> and <code>CARBON_CALCULATOR_API_URL</code> environment variables in the server runtime.</li>
                                <li>Set <code>CARBON_CALCULATOR_PROVIDER=EXTERNAL</code> in backend configuration.</li>
                                <li>The frontend requires <strong>zero code modifications</strong>, automatically receiving transparent response breakdowns and updating the provider status tag.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* SAVE MODAL DIALOG */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Save size={18} className="text-emerald-600" />
                                <h4 className="text-base font-bold text-slate-900">
                                    Save Calculation Record
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSaveModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">
                                    Record Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={saveTitle}
                                    onChange={(e) => setSaveTitle(e.target.value)}
                                    placeholder="e.g. Q1 Operational Carbon Audit"
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Organization
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={organizations.find((o) => String(o.id) === String(selectedOrgId))?.name || "None"}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Reporting Period
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={periods.find((p) => String(p.id) === String(selectedPeriodId))?.name || "Standalone"}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">
                                    Assessment Notes & Methodology Remarks
                                </label>
                                <textarea
                                    rows="3"
                                    value={saveNotes}
                                    onChange={(e) => setSaveNotes(e.target.value)}
                                    placeholder="Document measurement boundaries, utility bill numbers, or assumptions..."
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900">
                                <span className="font-bold">Total footprint to save: </span>
                                {calculationResult?.totalEmissionsTonnes} t CO2e ({calculationResult?.totalEmissionsKg} kg CO2e)
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowSaveModal(false)}
                                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={14} />
                                        Saving to Database...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} /> Confirm & Save
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL FOR HISTORICAL ITEM */}
            {selectedHistoryItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h4 className="text-base font-bold text-slate-900">
                                    {selectedHistoryItem.title}
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Saved for {selectedHistoryItem.organizationName}
                                    {selectedHistoryItem.reportingPeriodName ? ` · ${selectedHistoryItem.reportingPeriodName}` : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedHistoryItem(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 text-xs">
                            <div className="grid gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Emissions</span>
                                    <p className="mt-1 text-base font-extrabold text-slate-900">
                                        {Number(selectedHistoryItem.totalEmissionsTonnes).toFixed(4)} t
                                    </p>
                                    <p className="text-[10px] text-slate-500">{Number(selectedHistoryItem.totalEmissionsKg).toLocaleString()} kg CO2e</p>
                                </div>
                                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                                    <span className="text-[10px] uppercase font-bold text-rose-500">Scope 1 (Direct)</span>
                                    <p className="mt-1 text-base font-bold text-rose-950">
                                        {Number(selectedHistoryItem.scope1EmissionsKg).toLocaleString()} kg
                                    </p>
                                </div>
                                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                                    <span className="text-[10px] uppercase font-bold text-amber-500">Scope 2 (Electricity)</span>
                                    <p className="mt-1 text-base font-bold text-amber-950">
                                        {Number(selectedHistoryItem.scope2EmissionsKg).toLocaleString()} kg
                                    </p>
                                </div>
                                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                                    <span className="text-[10px] uppercase font-bold text-blue-500">Scope 3 (Transport)</span>
                                    <p className="mt-1 text-base font-bold text-blue-950">
                                        {Number(selectedHistoryItem.scope3EmissionsKg).toLocaleString()} kg
                                    </p>
                                </div>
                            </div>

                            {selectedHistoryItem.notes && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <span className="font-bold text-slate-700">Audit Notes: </span>
                                    {selectedHistoryItem.notes}
                                </div>
                            )}

                            {selectedHistoryItem.fullResult?.electricity && (
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <span className="font-bold text-slate-800">Electricity Formula: </span>
                                    <code className="block mt-1 bg-slate-50 p-2 rounded text-slate-700">
                                        {selectedHistoryItem.fullResult.electricity.formula}
                                    </code>
                                </div>
                            )}

                            {selectedHistoryItem.fullResult?.fuelItems?.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                    <span className="font-bold text-slate-800">Fuel Formulas:</span>
                                    {selectedHistoryItem.fullResult.fuelItems.map((f, idx) => (
                                        <code key={idx} className="block bg-slate-50 p-2 rounded text-slate-700">
                                            {f.formula}
                                        </code>
                                    ))}
                                </div>
                            )}

                            {selectedHistoryItem.fullResult?.transportItems?.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                    <span className="font-bold text-slate-800">Transport Formulas:</span>
                                    {selectedHistoryItem.fullResult.transportItems.map((t, idx) => (
                                        <code key={idx} className="block bg-slate-50 p-2 rounded text-slate-700">
                                            {t.formula}
                                        </code>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                                <span>Method: {selectedHistoryItem.calculationMethod}</span>
                                <span>Recorded by @{selectedHistoryItem.createdBy} on {new Date(selectedHistoryItem.calculatedAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedHistoryItem(null)}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
