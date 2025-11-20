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
import { useEffect, useState } from "react"

// Types for our data
interface SheetRow {
  [key: string]: any;
}

interface DashboardStats {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  trend: string;
  trendUp: boolean;
}

interface RecentActivityItem {
  id: number;
  description: string;
  amount: string;
  timestamp: string;
  status: string;
}

interface PaymentStatusData {
  name: string;
  value: number;
  fill: string;
}

interface TransactionTrendData {
  date: string;
  approved: number;
  pending: number;
  rejected: number;
}

// Apps Script URL
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec';

// Mock data for monthly revenue (you can replace these with real data later)
const monthlyRevenueData = [
  { month: "Jan", revenue: 12000, target: 15000 },
  { month: "Feb", revenue: 14500, target: 15000 },
  { month: "Mar", revenue: 13200, target: 15000 },
  { month: "Apr", revenue: 16800, target: 15000 },
  { month: "May", revenue: 18200, target: 15000 },
  { month: "Jun", revenue: 17500, target: 15000 },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats[]>([
    {
      title: "Total Requests",
      value: 0,
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
      trend: "+0%",
      trendUp: true,
    },
    {
      title: "Pending Approvals",
      value: 0,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      trend: "+0%",
      trendUp: false,
    },
    {
      title: "Payments Made",
      value: 0,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      trend: "+0%",
      trendUp: true,
    },
    {
      title: "Total Amount",
      value: "$0",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      trend: "+0%",
      trendUp: true,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData[]>([]);
  const [transactionTrendData, setTransactionTrendData] = useState<TransactionTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  // Format timestamp to relative time
  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return "Unknown time";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Format amount as currency
  const formatAmount = (amount: any) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Convert timestamp to day of week
  const getDayOfWeek = (timestamp: string) => {
    if (!timestamp) return "Unknown";
    
    const date = new Date(timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Fetch data from Google Sheets
  const fetchSheetData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${APP_SCRIPT_URL}?action=fetchSheet&sheetName=FMS&callback=?`);
      const text = await response.text();
      
      // Handle JSONP response
      const jsonString = text.replace(/^\?\(|\)$/g, '');
      const result = JSON.parse(jsonString);
      
      if (result.success && result.data) {
        calculateStats(result.data);
        generateRecentActivity(result.data);
        calculatePaymentStatus(result.data);
        calculateTransactionTrends(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching sheet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate transaction trends from sheet data
  const calculateTransactionTrends = (sheetData: SheetRow[]) => {
    if (!sheetData || sheetData.length === 0) {
      setTransactionTrendData([]);
      return;
    }

    const dayData: { [key: string]: { approved: number; pending: number; rejected: number } } = {};

    // Process data rows starting from row 7 (index 6)
    for (let i = 6; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;

      const timestamp = row[0]; // Column A (index 0)
      const dayOfWeek = getDayOfWeek(timestamp);
      const amount = parseFloat(row[13]) || 0; // Column N (index 13) - Amount
      const status = row[12] ? row[12].toString().trim() : ''; // Column M (index 12) - Status

      // Initialize day data if not exists
      if (!dayData[dayOfWeek]) {
        dayData[dayOfWeek] = { approved: 0, pending: 0, rejected: 0 };
      }

      // Categorize by status
      if (status === 'Approved') {
        dayData[dayOfWeek].approved += amount;
      } else if (status === 'Rejected') {
        dayData[dayOfWeek].rejected += amount;
      } else {
        // Null, empty, or any other value is considered pending
        dayData[dayOfWeek].pending += amount;
      }
    }

    // Convert to array format for the chart
    const trendData = Object.entries(dayData).map(([date, values]) => ({
      date,
      approved: Math.round(values.approved),
      pending: Math.round(values.pending),
      rejected: Math.round(values.rejected),
    }));

    // Sort by day of week (Sunday to Saturday)
    const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sortedTrendData = trendData.sort((a, b) => 
      dayOrder.indexOf(a.date) - dayOrder.indexOf(b.date)
    );

    setTransactionTrendData(sortedTrendData);
  };

  // Calculate statistics from sheet data
  const calculateStats = (sheetData: SheetRow[]) => {
    if (!sheetData || sheetData.length === 0) return;

    let totalRequests = 0;
    let pendingApprovals = 0;
    let paymentsMade = 0;
    let totalAmount = 0;

    // Start from row 7 (index 6) and process data rows
    for (let i = 6; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Column A (index 0) - Count if not empty/null
      if (row[0] && row[0].toString().trim() !== '') {
        totalRequests++;
      }

      // Column M (index 12) - Count pending approvals (not "Approved" and not "Rejected")
      const status = row[12] ? row[12].toString().trim() : '';
      if (status !== 'Approved' && status !== 'Rejected' && row[0] && row[0].toString().trim() !== '') {
        pendingApprovals++;
      }

      // Column S (index 18) - Count "Paid" payments
      const paymentStatus = row[18] ? row[18].toString().trim() : '';
      if (paymentStatus === 'Paid') {
        paymentsMade++;
        
        // Column N (index 13) - Sum amount only for paid payments
        const amount = parseFloat(row[13]) || 0;
        totalAmount += amount;
      }
    }

    // Format total amount as currency
    const formattedTotalAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalAmount);

    // Update stats with calculated values
    setStats([
      {
        title: "Total Requests",
        value: totalRequests,
        icon: BarChart3,
        color: "bg-blue-100 text-blue-600",
        trend: "+12%",
        trendUp: true,
      },
      {
        title: "Pending Approvals",
        value: pendingApprovals,
        icon: Clock,
        color: "bg-yellow-100 text-yellow-600",
        trend: "-5%",
        trendUp: false,
      },
      {
        title: "Payments Made",
        value: paymentsMade,
        icon: CheckCircle2,
        color: "bg-green-100 text-green-600",
        trend: "+23%",
        trendUp: true,
      },
      {
        title: "Total Amount",
        value: formattedTotalAmount,
        icon: TrendingUp,
        color: "bg-purple-100 text-purple-600",
        trend: "+18%",
        trendUp: true,
      },
    ]);
  };

  // Calculate payment status from sheet data
  const calculatePaymentStatus = (sheetData: SheetRow[]) => {
    if (!sheetData || sheetData.length === 0) {
      setPaymentStatusData([]);
      return;
    }

    let processingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    // Process data rows starting from row 7 (index 6)
    for (let i = 6; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;

      const status = row[12] ? row[12].toString().trim() : '';

      // Count based on status in Column M (index 12)
      if (status === '' || status === null) {
        processingCount++;
      } else if (status === 'Approved') {
        approvedCount++;
      } else if (status === 'Rejected') {
        rejectedCount++;
      }
    }

    const total = processingCount + approvedCount + rejectedCount;

    // Calculate percentages
    const processingPercentage = total > 0 ? Math.round((processingCount / total) * 100) : 0;
    const approvedPercentage = total > 0 ? Math.round((approvedCount / total) * 100) : 0;
    const rejectedPercentage = total > 0 ? Math.round((rejectedCount / total) * 100) : 0;

    // Update payment status data
    setPaymentStatusData([
      { name: "Processing", value: processingPercentage, fill: "#3b82f6" },
      { name: "Approved", value: approvedPercentage, fill: "#10b981" },
      { name: "Rejected", value: rejectedPercentage, fill: "#ef4444" },
    ]);
  };

  // Generate recent activity from sheet data
  const generateRecentActivity = (sheetData: SheetRow[]) => {
    if (!sheetData || sheetData.length === 0) {
      setRecentActivity([]);
      return;
    }

    const activities: RecentActivityItem[] = [];

    // Process data rows starting from row 7 (index 6)
    for (let i = 6; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;

      const fmsName = row[4] ? row[4].toString().trim() : 'Unknown FMS';
      const storeFMS = row[5] ? row[5].toString().trim() : 'Unknown Store';
      const status = row[12] ? row[12].toString().trim() : '';
      const amount = row[13] || 0;
      const timestamp = row[0];

      // Determine status text
      let statusText = 'pending';
      if (status === 'Approved') {
        statusText = 'approved';
      } else if (status === 'Rejected') {
        statusText = 'rejected';
      }

      // Create activity description
      const description = `${fmsName} - ${storeFMS}`;

      activities.push({
        id: i + 1, // Use row number as ID
        description,
        amount: formatAmount(amount),
        timestamp: getTimeAgo(timestamp),
        status: statusText,
      });
    }

    // Sort by timestamp (newest first) and take latest 5
    const sortedActivities = activities
      .sort((a, b) => {
        // Since we don't have exact dates, we'll sort by row number (assuming newer rows are at the bottom)
        return b.id - a.id;
      })
      .slice(0, 5);

    setRecentActivity(sortedActivities);
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your payment workflow overview.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your payment workflow overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {/* {stat.trendUp ? (
                      <ArrowUp size={16} className="text-green-600" />
                    ) : (
                      <ArrowDown size={16} className="text-red-600" />
                    )}
                    <span className={stat.trendUp ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                      {stat.trend}
                    </span> */}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transaction Trend Chart */}
        <Card className="lg:col-span-3 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Transaction Trends
            </h2>
            <p className="text-muted-foreground text-sm">
              Weekly transaction overview
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value) => [`₹${value}`, '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981" }}
                name="Approved"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b" }}
                name="Pending"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444" }}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Payment Status
            </h2>
            <p className="text-muted-foreground text-sm">Distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* <Card className="p-6">
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
      </Card> */}

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <p className="text-muted-foreground text-sm">
            Latest transactions and requests
          </p>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    {activity.amount}
                  </span>
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
                    {activity.status.charAt(0).toUpperCase() +
                      activity.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}