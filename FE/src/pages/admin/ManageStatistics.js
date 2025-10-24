import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { fetchSummary, fetchOrderStatus } from "../../api/statisticsApi";

ChartJS.register(ArcElement, Tooltip, Legend);

const ManageStatistics = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [animatedValues, setAnimatedValues] = useState({
    totalOrders: 1,
    totalRevenue: 1,
    totalProducts: 1,
    totalUsers: 1,
  });
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryData, orderStatusData] = await Promise.all([
          fetchSummary(),
          fetchOrderStatus(),
        ]);
        setSummary(summaryData);
        setOrderStatus(orderStatusData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const animateValue = (target, key) => {
      let start = 1;
      const end = target;
      const increment = end / 100; 
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(interval);
          start = end;
        }
        setAnimatedValues((prevValues) => ({
          ...prevValues,
          [key]: Math.floor(start),
        }));
      }, 10); 
    };

    animateValue(summary.totalOrders, "totalOrders");
    animateValue(summary.totalRevenue, "totalRevenue");
    animateValue(summary.totalProducts, "totalProducts");
    animateValue(summary.totalUsers, "totalUsers");
  }, [summary]);

  const chartData = {
    labels: orderStatus.map((status) => status._id.toUpperCase()),
    datasets: [
      {
        data: orderStatus.map((status) => status.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 10 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = orderStatus.reduce(
              (acc, status) => acc + status.count,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return <div className="text-center py-3 fs-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-3 text-danger fs-6">{error}</div>;
  }

  return (
    <div style={{ padding: "15px" }}>
      <h1 className="h4 fw-bold mb-3">Dashboard Statistics</h1>

      <div className="row row-cols-2 row-cols-md-4 g-3 mb-3">
        <div className="col">
          <div className="card h-100 shadow-sm">
            <div className="card-body p-3">
              <h2 className="card-title fs-6 fw-semibold mb-1">Total Orders</h2>
              <p className="card-text fs-4 text-primary">
                {animatedValues.totalOrders}
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 shadow-sm">
            <div className="card-body p-3">
              <h2 className="card-title fs-6 fw-semibold mb-1">
                Total Revenue
              </h2>
              <p className="card-text fs-4 text-success">
                ${animatedValues.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 shadow-sm">
            <div className="card-body p-3">
              <h2 className="card-title fs-6 fw-semibold mb-1">
                Total Products
              </h2>
              <p className="card-text fs-4 text-purple">
                {animatedValues.totalProducts}
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 shadow-sm">
            <div className="card-body p-3">
              <h2 className="card-title fs-6 fw-semibold mb-1">Total Users</h2>
              <p className="card-text fs-4 text-warning">
                {animatedValues.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3">
          <h2 className="card-title h5 fw-semibold mb-2">
            Order Status Distribution
          </h2>
          <div style={{ width: "240px", height: "240px", margin: "0 auto" }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStatistics;
