"use client"

import { Card } from "@/components/ui/card"
import { BarChart3, Clock, CheckCircle2, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const stats = [
  {
    title: "Total Requests",
    value: 12,
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600",
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "Pending Approvals",
    value: 8,
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600",
    trend: "-5%",
    trendUp: false,
  },
  {
    title: "Payments Made",
    value: 15,
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600",
    trend: "+23%",
    trendUp: true,
  },
  {
    title: "Total Amount",
    value: "$45.2K",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
    trend: "+18%",
    trendUp: true,
  },
]

const transactionTrendData = [
  { date: "Mon", value: 2400, approved: 2000, pending: 400 },
  { date: "Tue", value: 3200, approved: 2600, pending: 600 },
  { date: "Wed", value: 2800, approved: 2200, pending: 600 },
  { date: "Thu", value: 3900, approved: 3200, pending: 700 },
  { date: "Fri", value: 4200, approved: 3600, pending: 600 },
  { date: "Sat", value: 2900, approved: 2400, pending: 500 },
  { date: "Sun", value: 3400, approved: 2800, pending: 600 },
]

const paymentStatusData = [
  { name: "Approved", value: 45, fill: "#10b981" },
  { name: "Pending", value: 30, fill: "#f59e0b" },
  { name: "Processing", value: 15, fill: "#3b82f6" },
  { name: "Rejected", value: 10, fill: "#ef4444" },
]

const monthlyRevenueData = [
  { month: "Jan", revenue: 12000, target: 15000 },
  { month: "Feb", revenue: 14500, target: 15000 },
  { month: "Mar", revenue: 13200, target: 15000 },
  { month: "Apr", revenue: 16800, target: 15000 },
  { month: "May", revenue: 18200, target: 15000 },
  { month: "Jun", revenue: 17500, target: 15000 },
]

const recentActivity = [
  {
    id: 1,
    description: "Payment approved for Invoice #2024-001",
    amount: "$2,500",
    timestamp: "2 hours ago",
    status: "approved",
  },
  {
    id: 2,
    description: "New request submitted by John Doe",
    amount: "$1,200",
    timestamp: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    description: "Payment processed for Invoice #2024-002",
    amount: "$3,800",
    timestamp: "6 hours ago",
    status: "processing",
  },
  {
    id: 4,
    description: "Request rejected - Missing documentation",
    amount: "$950",
    timestamp: "1 day ago",
    status: "rejected",
  },
  {
    id: 5,
    description: "Payment completed for Invoice #2024-003",
    amount: "$2,100",
    timestamp: "1 day ago",
    status: "approved",
  },
]

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your payment workflow overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trendUp ? (
                      <ArrowUp size={16} className="text-green-600" />
                    ) : (
                      <ArrowDown size={16} className="text-red-600" />
                    )}
                    <span className={stat.trendUp ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Transaction Trends</h2>
            <p className="text-muted-foreground text-sm">Weekly transaction overview</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Payment Status</h2>
            <p className="text-muted-foreground text-sm">Distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Monthly Revenue</h2>
          <p className="text-muted-foreground text-sm">Revenue vs Target</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs text-muted-foreground" />
            <YAxis className="text-xs text-muted-foreground" />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" />
            <Bar dataKey="target" fill="#d1d5db" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">Latest transactions and requests</p>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">{activity.amount}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : activity.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : activity.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
