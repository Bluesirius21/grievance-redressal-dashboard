import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  Users,
  Award,
  Activity,
  TrendingUp,
  BarChart3,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  Building2,
  ChevronDown
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const baseUrl = import.meta.env.BASE_URL || '/';
        const jsonUrl = baseUrl.endsWith('/')
          ? `${baseUrl}india_states_dashboard_data.json`
          : `${baseUrl}/india_states_dashboard_data.json`;
        const res = await fetch(jsonUrl);
        if (!res.ok) {
          throw new Error(`Failed to load data (HTTP ${res.status})`);
        }
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'An error occurred while loading grievance dataset.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stateList = useMemo(() => {
    if (!dashboardData) return [];
    return Object.keys(dashboardData).sort();
  }, [dashboardData]);

  const currentStateData = useMemo(() => {
    if (!dashboardData) return null;
    return dashboardData[selectedState] || dashboardData['Maharashtra'] || null;
  }, [dashboardData, selectedState]);

  // Chart 1: Monthly Registration Trend (Line Chart)
  const lineChartData = useMemo(() => {
    if (!currentStateData || !currentStateData.monthly_trend) {
      return { labels: [], datasets: [] };
    }

    const labels = currentStateData.monthly_trend.map((item) => item.year_month);
    const dataPoints = currentStateData.monthly_trend.map((item) => item.registrations);

    return {
      labels,
      datasets: [
        {
          label: 'Citizen Registrations',
          data: dataPoints,
          borderColor: '#2563eb', // royal blue
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.32)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
            return gradient;
          },
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
          pointRadius: 2.5,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1d4ed8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };
  }, [currentStateData]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} citizens`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0,
          maxTicksLimit: 12
        }
      },
      y: {
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => Number(value).toLocaleString()
        },
        beginAtZero: true
      }
    }
  };

  // Chart 2: Top Districts by Volume (Bar Chart)
  const barChartData = useMemo(() => {
    if (!currentStateData || !currentStateData.top_districts) {
      return { labels: [], datasets: [] };
    }

    const topItems = currentStateData.top_districts.slice(0, 8);
    const labels = topItems.map((item) => item['District Name']);
    const dataPoints = topItems.map((item) => item.total_users);

    return {
      labels,
      datasets: [
        {
          label: 'Registered Users',
          data: dataPoints,
          backgroundColor: '#059669', // emerald
          hoverBackgroundColor: '#047857',
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    };
  }, [currentStateData]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} users`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          maxRotation: 30,
          minRotation: 0
        }
      },
      y: {
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => Number(value).toLocaleString()
        },
        beginAtZero: true
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Loading Dashboard Data</h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyzing state-level grievance registrations across India...
          </p>
        </div>
      </div>
    );
  }

  if (error || !currentStateData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Data Load Error</h2>
          <p className="text-sm text-slate-600 mt-2">{error || 'No data found for this selection.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/20"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { total_users, pct_female, pct_male, national_rank } = currentStateData;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  Open Data Portal
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">CPGRAMS Registry</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Public Grievance Dashboard: Access &amp; Efficiency
              </h1>
            </div>

            {/* State Selector Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="state-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:block">
                Region:
              </label>
              <div className="relative min-w-[220px]">
                <select
                  id="state-select"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl pl-3.5 pr-10 py-2.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {stateList.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards Grid */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1: Total Registered Users */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Registered Users
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {total_users.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 flex items-center text-xs text-slate-500 gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Verified citizen accounts in {selectedState}</span>
              </div>
            </div>

            {/* KPI 2: National Rank */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  National Rank
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  #{national_rank}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 36</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-slate-500 gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Ranked by cumulative citizen onboarding</span>
              </div>
            </div>

            {/* KPI 3: Gender Access Split */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gender Access Split
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-medium text-slate-500">Male:</span>
                  <span className="text-lg font-bold text-slate-900">{pct_male}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-medium text-slate-500">Female:</span>
                  <span className="text-lg font-bold text-slate-900">{pct_female}%</span>
                </div>
              </div>

              {/* Horizontal CSS Progress Bar */}
              <div className="mt-3 w-full bg-slate-100 rounded-full h-3 overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${pct_male}%` }}
                  title={`Male: ${pct_male}%`}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${pct_female}%` }}
                  title={`Female: ${pct_female}%`}
                />
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-slate-400">
                <span>Access ratio visualization</span>
                <span>{((100 - pct_male - pct_female) > 0.1) ? `Other: ${(100 - pct_male - pct_female).toFixed(1)}%` : '100% split'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section aria-label="Visual Analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Line Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Monthly Registration Trend
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Timeline of citizen onboarding over time
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                Timeline
              </span>
            </div>
            <div className="h-72 w-full mt-2">
              {currentStateData.monthly_trend && currentStateData.monthly_trend.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No monthly trend data available for this state.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Top Districts by Volume
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-adoption administrative districts
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md">
                Districts
              </span>
            </div>
            <div className="h-72 w-full mt-2">
              {currentStateData.top_districts && currentStateData.top_districts.length > 0 ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No district volume data available for this state.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Insights & Breakdown Table */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                Administrative District Breakdown — {selectedState}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of user registrations across top reporting districts
              </p>
            </div>
            <span className="text-xs text-slate-400">
              Showing top {currentStateData.top_districts ? currentStateData.top_districts.length : 0} districts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">District Name</th>
                  <th className="px-6 py-3 text-right">Registered Users</th>
                  <th className="px-6 py-3 text-right">Share of State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentStateData.top_districts && currentStateData.top_districts.length > 0 ? (
                  currentStateData.top_districts.map((district, idx) => {
                    const share = total_users > 0 ? ((district.total_users / total_users) * 100).toFixed(1) : '0';
                    return (
                      <tr key={district['District Name'] || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-xs font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-3.5 font-medium text-slate-800">{district['District Name']}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                          {district.total_users.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs font-medium text-slate-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {share}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No district breakdown data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Public Grievance Redressal Monitoring Portal. Open Citizen Analytics.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Client-Side Dashboard
            </span>
            <span>•</span>
            <span>36 States &amp; UTs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
