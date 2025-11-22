import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Analytics.css";
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
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly"); // daily, weekly, monthly

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders_main")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      // Fetch order items with product names
      const { data: itemsData, error: itemsError } = await supabase
        .from("orders_items")
        .select(`
          *,
          products(name)
        `);

      if (itemsError) {
        console.error("Error fetching items:", itemsError);
        return;
      }

      setOrders(ordersData || []);
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total sales
  const totalSales = orders
    .filter((o) => o.status === "Completed")
    .reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);

  // Calculate total orders
  const totalOrders = orders.filter((o) => o.status === "Completed").length;

  // Get date range based on timeRange
  const getDateRange = (range) => {
    const now = new Date();
    const ranges = {
      daily: {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        previous: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        ),
      },
      weekly: {
        start: (() => {
          const date = new Date(now);
          const day = date.getDay();
          const diff = date.getDate() - day;
          return new Date(date.setDate(diff));
        })(),
        previous: (() => {
          const date = new Date(now);
          const day = date.getDay();
          const diff = date.getDate() - day - 7;
          return new Date(date.setDate(diff));
        })(),
      },
      monthly: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        previous: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      },
    };
    return ranges[range] || ranges.monthly;
  };

  // Filter orders by date range
  const getOrdersInRange = (startDate, endDate) => {
    return orders.filter((order) => {
      if (order.status !== "Completed") return false;
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Calculate sales for current and previous period
  const calculatePeriodSales = () => {
    const { start, previous } = getDateRange(timeRange);
    const now = new Date();
    const previousEnd = new Date(start);
    previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);

    const currentPeriodOrders = getOrdersInRange(start, now);
    const previousPeriodOrders = getOrdersInRange(previous, previousEnd);

    const currentSales = currentPeriodOrders.reduce(
      (sum, order) => sum + (parseFloat(order.total_price) || 0),
      0
    );
    const previousSales = previousPeriodOrders.reduce(
      (sum, order) => sum + (parseFloat(order.total_price) || 0),
      0
    );

    const change = previousSales > 0 
      ? ((currentSales - previousSales) / previousSales) * 100 
      : 0;

    return { currentSales, previousSales, change };
  };

  const { currentSales, previousSales, change } = calculatePeriodSales();

  // Prepare chart data based on time range
  const prepareChartData = () => {
    const { start } = getDateRange(timeRange);
    const now = new Date();
    const filteredOrders = getOrdersInRange(start, now);

    if (timeRange === "daily") {
      // Group by hour
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const salesByHour = hours.map((hour) => {
        const hourOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getHours() === hour;
        });
        return hourOrders.reduce(
          (sum, order) => sum + (parseFloat(order.total_price) || 0),
          0
        );
      });

      return {
        labels: hours.map((h) => `${h}:00`),
        data: salesByHour,
      };
    } else if (timeRange === "weekly") {
      // Group by day of week
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const salesByDay = days.map((_, dayIndex) => {
        const dayOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getDay() === dayIndex;
        });
        return dayOrders.reduce(
          (sum, order) => sum + (parseFloat(order.total_price) || 0),
          0
        );
      });

      return {
        labels: days,
        data: salesByDay,
      };
    } else {
      // Monthly - group by day
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      const salesByDay = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getDate() === day;
        });
        return dayOrders.reduce(
          (sum, order) => sum + (parseFloat(order.total_price) || 0),
          0
        );
      });

      return {
        labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        data: salesByDay,
      };
    }
  };

  const chartData = prepareChartData();

  // Top selling products
  const getTopSellingProducts = () => {
    const productSales = {};
    items.forEach((item) => {
      const productName = item.products?.name || "Unknown";
      if (!productSales[productName]) {
        productSales[productName] = {
          name: productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[productName].quantity += item.quantity || 0;
      productSales[productName].revenue += parseFloat(item.total_price) || 0;
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const topProducts = getTopSellingProducts();

  // Chart configurations
  const salesChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Sales ($)",
        data: chartData.data,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Sales`,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
      },
    },
  };

  const topProductsChartData = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: "Revenue ($)",
        data: topProducts.map((p) => p.revenue),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
          "rgb(139, 92, 246)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const topProductsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top Selling Products by Revenue",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
        <div className="analytics-header">
          <h1>📊 Analytics Dashboard</h1>
          <button
            className="back-button"
            onClick={() => navigate("/adminpanel")}
          >
            ← Back to Admin Panel
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button
            className={timeRange === "daily" ? "active" : ""}
            onClick={() => setTimeRange("daily")}
          >
            Daily
          </button>
          <button
            className={timeRange === "weekly" ? "active" : ""}
            onClick={() => setTimeRange("weekly")}
          >
            Weekly
          </button>
          <button
            className={timeRange === "monthly" ? "active" : ""}
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </button>
        </div>

        {/* Sales Overview Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Sales</h3>
              <p className="stat-value">${totalSales.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{totalOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Sales
              </h3>
              <p className="stat-value">${currentSales.toFixed(2)}</p>
              <p
                className={`stat-change ${change >= 0 ? "positive" : "negative"}`}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% vs
                previous period
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Average Order Value</h3>
              <p className="stat-value">
                ${totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-wrapper">
              <Line data={salesChartData} options={salesChartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-wrapper">
              <Bar data={topProductsChartData} options={topProductsChartOptions} />
            </div>
          </div>
        </div>

        {/* Top Selling Products Table */}
        <div className="top-products-section">
          <h2>🏆 Top Selling Products</h2>
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={product.name}>
                      <td>
                        <span className="rank-badge">{index + 1}</span>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td className="revenue-cell">
                        ${product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

