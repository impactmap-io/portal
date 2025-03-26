import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Activity, Calendar, Tag, Clock, FileBadge as FileBar, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { goals, impacts, deliverables } from '../data/seed';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
const CATEGORIES = ['performance', 'engagement', 'satisfaction', 'adoption'];

export default function Analytics() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [timeRange, setTimeRange] = React.useState<string>('1m');

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const positiveImpacts = impacts.filter((i) => i.status === 'positive').length;
  const negativeImpacts = impacts.filter((i) => i.status === 'negative').length;
  const neutralImpacts = impacts.filter((i) => i.status === 'neutral').length;
  const completedDeliverables = deliverables.filter((d) => d.status === 'completed').length;
  const plannedDeliverables = deliverables.filter((d) => d.status === 'planned').length;
  const inProgressDeliverables = deliverables.filter((d) => d.status === 'in-progress').length;

  const impactData = [
    { name: 'Positive', value: positiveImpacts },
    { name: 'Negative', value: negativeImpacts },
    { name: 'Neutral', value: neutralImpacts },
  ];

  const deliverableStatusData = [
    { name: 'Completed', value: completedDeliverables },
    { name: 'In Progress', value: inProgressDeliverables },
    { name: 'Planned', value: plannedDeliverables },
  ];

  const priorityData = [
    { name: 'High', count: deliverables.filter((d) => d.priority === 'high').length },
    { name: 'Medium', count: deliverables.filter((d) => d.priority === 'medium').length },
    { name: 'Low', count: deliverables.filter((d) => d.priority === 'low').length },
  ];

  const timelineData = goals.map((goal) => ({
    name: goal.title,
    progress: Math.round((completedDeliverables / deliverables.length) * 100),
    deadline: new Date(goal.deadline).getTime(),
  })).sort((a, b) => a.deadline - b.deadline);

  const stats = [
    {
      name: 'Goal Completion Rate',
      value: `${Math.round((completedGoals / totalGoals) * 100)}%`,
      icon: TrendingUp,
      description: `${completedGoals} of ${totalGoals} goals completed`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Impact Balance',
      value: `${positiveImpacts - negativeImpacts}`,
      icon: BarChart3,
      description: `${positiveImpacts} positive vs ${negativeImpacts} negative`,
      color: positiveImpacts >= negativeImpacts ? 'text-blue-600' : 'text-red-600',
      bgColor: positiveImpacts >= negativeImpacts ? 'bg-blue-100' : 'bg-red-100',
    },
    {
      name: 'Deliverables Progress',
      value: `${Math.round((completedDeliverables / deliverables.length) * 100)}%`,
      icon: CheckCircle,
      description: `${completedDeliverables} completed, ${plannedDeliverables} planned`,
      color: 'text-black',
      bgColor: 'bg-indigo-100',
    },
    {
      name: 'Risk Score',
      value: negativeImpacts > positiveImpacts ? 'High' : 'Low',
      icon: AlertTriangle,
      description: `Based on impact analysis`,
      color: negativeImpacts > positiveImpacts ? 'text-red-600' : 'text-green-600',
      bgColor: negativeImpacts > positiveImpacts ? 'bg-red-100' : 'bg-green-100',
    },
  ];

  // Get all metrics from impacts
  const allMetrics = impacts
    .flatMap(impact => impact.metrics || [])
    .filter(metric => 
      selectedCategory === 'all' || metric.category === selectedCategory
    );

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: allMetrics.map(metric => ({
        name: metric.name,
        current: metric.value,
        target: metric.target,
        progress: ((metric.value / metric.target) * 100).toFixed(1) + '%',
        trend: metric.trend?.[metric.trend.length - 1] - metric.trend?.[0],
      })),
      summary: {
        totalMetrics: allMetrics.length,
        metricsOnTrack: allMetrics.filter(m => m.value >= m.target).length,
        averageProgress: allMetrics.reduce((acc, m) => 
          acc + (m.value / m.target), 0) / allMetrics.length * 100,
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact-metrics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        <button
          onClick={generateReport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Chart */}
      <div className="grid grid-cols-1 gap-6">
        {/* Detailed Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Detailed Metrics Analysis</h3>
          <div className="space-y-6">
            {allMetrics.map((metric) => (
              <div key={metric.name} className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {metric.category}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {metric.frequency}
                      </span>
                      <span className="flex items-center">
                        <FileBar className="w-4 h-4 mr-1" />
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metric.value}
                      <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {metric.target} {metric.unit}
                    </div>
                  </div>
                </div>

                {metric.historicalData && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.historicalData}>
                        <defs>
                          <linearGradient id={`gradient-${metric.name}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(data.date).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Value: {data.value} {metric.unit}
                                  </p>
                                  {data.annotations?.map((note, i) => (
                                    <p key={i} className="text-sm text-gray-500 mt-1">
                                      Note: {note}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#4F46E5"
                          fillOpacity={1}
                          fill={`url(#gradient-${metric.name})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Goal Progress Timeline</h3>
          <LineChart width={500} height={300} data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="progress" stroke="#4F46E5" />
          </LineChart>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Impact Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={impactData}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {impactData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Deliverable Status</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={deliverableStatusData}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {deliverableStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Priority Distribution</h3>
          <BarChart width={500} height={300} data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4F46E5" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
