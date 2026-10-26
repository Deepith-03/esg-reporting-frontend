
import { useEffect, useState } from "react";
import api from "./api/axiosConfig";
import Organizations from "./components/organizations/Organizations";
import ReportingPeriods from "./components/reporting-periods/ReportingPeriods";
import EsgMetrics from "./components/esg-metrics/EsgMetrics";
import MetricEntries from "./components/esg-metrics/MetricEntries";
import Evidence from "./components/evidence/Evidence";
import AuditTrail from "./components/audit/AuditTrail";
import DataManagement from "./components/admin/DataManagement";
import CarbonCalculator from "./components/carbon/CarbonCalculator";
import { FileCheck, History, Database, Calculator } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import Login from "./components/auth/Login";

import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Leaf,
  Users,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  Menu,
  ArrowUpRight,
} from "lucide-react";

<div className="p-5 md:p-8"></div>

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Organizations", icon: Building2 },
  { name: "Reporting Periods", icon: ClipboardList },
  { name: "ESG Metrics", icon: Leaf },
  { name: "Metric Entries", icon: ClipboardList },
  { name: "Carbon Calculator", icon: Calculator },
  { name: "Social Impact", icon: Users },
  { name: "Governance", icon: ShieldCheck },
  {
    name: "Evidence",
    icon: FileCheck,
    value: "evidence",
  },
  {
    name: "Audit Trail",
    icon: History,
  },
  {
    name: "Data Management",
    icon: Database,
  },
];

const summaryCards = [
  {
    title: "Organizations",
    value: "0",
    description: "Registered organizations",
    icon: Building2,
  },
  {
    title: "Reporting Periods",
    value: "0",
    description: "Total reporting periods",
    icon: ClipboardList,
  },
  {
    title: "Pending Reviews",
    value: "0",
    description: "Reports awaiting review",
    icon: ShieldCheck,
  },
  {
    title: "ESG Metrics",
    value: "0",
    description: "Metrics being tracked",
    icon: Leaf,
  },
];


const rolePermissions = {
  ADMIN: [
    "Dashboard",
    "Organizations",
    "Reporting Periods",
    "ESG Metrics",
    "Metric Entries",
    "Carbon Calculator",
    "Evidence",
    "Reporting Workflow",
    "Audit Trail",
    "Data Management",
  ],
  DATA_ENTRY: [
    "Dashboard",
    "Organizations",
    "Reporting Periods",
    "ESG Metrics",
    "Metric Entries",
    "Carbon Calculator",
    "Evidence",
    "Reporting Workflow",
    "Audit Trail",
  ],
  REVIEWER: [
    "Dashboard",
    "Organizations",
    "Reporting Periods",
    "ESG Metrics",
    "Metric Entries",
    "Carbon Calculator",
    "Evidence",
    "Reporting Workflow",
    "Audit Trail",
  ],
  VIEWER: [
    "Dashboard",
    "Organizations",
    "Reporting Periods",
    "ESG Metrics",
    "Metric Entries",
    "Carbon Calculator",
    "Evidence",
    "Reporting Workflow",
    "Audit Trail",
  ],
};

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [organizationError, setOrganizationError] = useState("");
  const [reportingPeriods, setReportingPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [metricDefinitions, setMetricDefinitions] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const draftCount = reportingPeriods.filter(
    (period) => period.status === "DRAFT"
  ).length;

  const submittedCount = reportingPeriods.filter(
    (period) => period.status === "SUBMITTED"
  ).length;

  const approvedCount = reportingPeriods.filter(
    (period) => period.status === "APPROVED"
  ).length;

  const environmentalCount = metricDefinitions.filter(
    (metric) => metric.pillar === "ENVIRONMENTAL"
  ).length;

  const socialCount = metricDefinitions.filter(
    (metric) => metric.pillar === "SOCIAL"
  ).length;

  const governanceCount = metricDefinitions.filter(
    (metric) => metric.pillar === "GOVERNANCE"
  ).length;

  useEffect(() => {
    if (!currentUser) return;
    const fetchMetricDefinitions = async () => {
      try {
        const response = await api.get("/metric-definitions");
        setMetricDefinitions(response.data);
      } catch (error) {
        console.error("Failed to fetch metric definitions:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetricDefinitions();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchReportingPeriods = async () => {
      try {
        const response = await api.get("/organizations/1/periods");
        setReportingPeriods(response.data);
      } catch (error) {
        console.error("Failed to fetch reporting periods:", error);
      } finally {
        setLoadingPeriods(false);
      }
    };

    fetchReportingPeriods();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchOrganizations = async () => {
      try {
        const response = await api.get("/organizations");
        setOrganizations(response.data);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        setOrganizationError("Unable to load organizations.");
      } finally {
        setLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, [currentUser]);


  const cards = summaryCards.map((card) => {
    if (card.title === "ESG Metrics") {
      return {
        ...card,
        value: loadingMetrics ? "..." : String(metricDefinitions.length),
        description: "Defined ESG metrics",
      };
    }

    if (card.title === "Organizations") {
      return {
        ...card,
        value: loadingOrganizations
          ? "..."
          : organizationError
            ? "—"
            : String(organizations.length),
        description: organizationError
          ? organizationError
          : "Registered organizations",
      };
    }

    if (card.title === "Reporting Periods") {
      return {
        ...card,
        value: loadingPeriods ? "..." : String(reportingPeriods.length),
        description: "Total reporting periods",
      };
    }

    return card;
  });

  const handleLogin = async (username, password) => {
    api.defaults.auth = { username, password };

    try {
      await api.get("/organizations");

      const roles = {
        admin: "ADMIN",
        dataentry: "DATA_ENTRY",
        reviewer: "REVIEWER",
        viewer: "VIEWER",
      };

      const normalizedUsername = username.trim().toLowerCase();

      setCurrentUser({
        username: normalizedUsername,
        role: roles[normalizedUsername],
      });
      toast.success("Login successful!");
    } catch (error) {
      delete api.defaults.auth;
      setCurrentUser(null);
      console.error("Login failed:", error);
      throw error;
    }
  };


  const handleLogout = () => {
    delete api.defaults.auth;
    setCurrentUser(null);
    toast.success("Logged out successfully!");
  };


  return (
    <>
      <Toaster position="top-right" />
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <div className="flex min-h-screen">
            <aside
              className={`${sidebarOpen ? "w-64" : "w-20"
                } hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex`}
            >
              <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Leaf size={23} />
                </div>

                {sidebarOpen && (
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">
                      EcoTrack
                    </h1>
                    <p className="text-xs text-slate-500">
                      ESG Reporting Platform
                    </p>
                  </div>
                )}
              </div>

              <nav className="flex-1 space-y-1 px-3 py-6">
                {navigation
                  .filter((item) =>
                    (rolePermissions[currentUser.role] || []).includes(item.name)
                  )
                  .map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      onClick={() => setActivePage(name)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${activePage === name
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Icon size={20} className="shrink-0" />
                      {sidebarOpen && <span>{name}</span>}
                    </button>
                  ))}
              </nav>

              <div className="border-t border-slate-100 p-3">
                <button
                  onClick={() => setActivePage("Settings")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings size={20} />
                  {sidebarOpen && "Settings"}
                </button>
              </div>
            </aside>

            <main className="min-w-0 flex-1">
              <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-lg p-2 hover:bg-slate-100"
                    aria-label="Toggle sidebar"
                  >
                    <Menu size={22} />
                  </button>

                  <div>
                    <h2 className="text-xl font-bold">{activePage}</h2>
                    <p className="hidden text-sm text-slate-500 sm:block">
                      Monitor and manage your ESG reporting
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    aria-label="Search"
                    className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
                  >
                    <Search size={19} />
                  </button>
                  <button
                    aria-label="Notifications"
                    className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
                  >
                    <Bell size={19} />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                    A
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>

                </div>
              </header>

              <div className="p-5 md:p-8">
                {activePage === "Organizations" ? (
                  <Organizations currentUser={currentUser} />
                ) : activePage === "Reporting Periods" ? (
                  <ReportingPeriods currentUser={currentUser} />
                ) : activePage === "ESG Metrics" ? (
                  <EsgMetrics currentUser={currentUser} />
                ) : activePage === "Metric Entries" ? (
                  <MetricEntries currentUser={currentUser} />
                ) : activePage === "Carbon Calculator" ? (
                  <CarbonCalculator currentUser={currentUser} />
                ) : activePage === "Evidence" ? (
                  <Evidence currentUser={currentUser} />
                ) : activePage === "Audit Trail" ? (
                  <AuditTrail currentUser={currentUser} />
                ) : activePage === "Data Management" ? (
                  <DataManagement
                    currentUser={currentUser}
                    onDataChanged={async () => {
                      try {
                        const [orgRes, periodRes] = await Promise.all([
                          api.get("/organizations"),
                          api.get("/organizations/1/periods").catch(() => ({ data: [] })),
                        ]);
                        setOrganizations(orgRes.data);
                        setReportingPeriods(periodRes.data);
                      } catch (e) {
                        console.error("Failed to refresh dashboard data after cleanup:", e);
                      }
                    }}
                  />
                ) : (
                  <>
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight">
                          ESG Overview
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Your sustainability reporting at a glance.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setActivePage("Carbon Calculator")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 shadow-xs transition hover:bg-emerald-100"
                        >
                          <Calculator size={17} />
                          Carbon Calculator
                        </button>

                        <button
                          onClick={() => setActivePage("Reporting Periods")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          View Reporting Periods
                          <ArrowUpRight size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      {cards.map(({ title, value, description, icon: Icon }) => (
                        <div
                          key={title}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                              <Icon size={22} />
                            </div>
                            <span className="text-xs font-medium text-slate-400">
                              Overview
                            </span>
                          </div>

                          <p className="mt-5 text-sm font-medium text-slate-500">
                            {title}
                          </p>
                          <p className="mt-1 text-3xl font-bold">{value}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 grid gap-6 xl:grid-cols-3">
                      <section className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-bold">
                              ESG Reporting Progress
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              Track reports through the approval workflow.
                            </p>
                          </div>
                          <ClipboardList className="text-emerald-600" size={24} />
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                          {[
                            {
                              label: "Draft",
                              color: "bg-slate-400",
                              count: draftCount,
                            },
                            {
                              label: "Submitted",
                              color: "bg-blue-500",
                              count: submittedCount,
                            },
                            {
                              label: "Changes Requested",
                              color: "bg-amber-500",
                              count: reportingPeriods.filter(
                                (period) => period.status === "CHANGES_REQUESTED"
                              ).length,
                            },
                            {
                              label: "Approved",
                              color: "bg-emerald-500",
                              count: approvedCount,
                            },
                          ].map((status) => (
                            <div
                              key={status.label}
                              className="rounded-xl bg-slate-50 p-4"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${status.color}`}
                                />
                                <span className="text-sm font-medium text-slate-600">
                                  {status.label}
                                </span>
                              </div>
                              <p className="mt-4 text-2xl font-bold">{status.count}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Reporting periods
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center gap-2">
                          <Leaf size={22} className="text-emerald-600" />
                          <h4 className="text-lg font-bold">ESG Pillars</h4>
                        </div>

                        <div className="mt-6 space-y-5">
                          {[
                            {
                              name: "Environmental",
                              description: `${environmentalCount} metrics`,
                              color: "bg-emerald-500",
                            },
                            {
                              name: "Social",
                              description: `${socialCount} metrics`,
                              color: "bg-blue-500",
                            },
                            {
                              name: "Governance",
                              description: `${governanceCount} metrics`,
                              color: "bg-violet-500",
                            },
                          ].map((pillar) => (
                            <div key={pillar.name}>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${pillar.color}`}
                                />
                                <p className="text-sm font-semibold">{pillar.name}</p>
                              </div>
                              <p className="ml-5 mt-1 text-xs text-slate-500">
                                {pillar.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-400">
                      EcoTrack ESG Reporting · Dashboard preview
                    </p>
                  </>
                )}

              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

<div className="p-5 md:p-8"></div>