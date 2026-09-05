/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Empty, Input, Select, Spin } from "antd";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { useGetAllRentalsQuery } from "../../redux/features/rental/rentalApi";
import { useGetAllVehiclesQuery } from "../../redux/features/vehicle/vehicleApi";
import type { TRentalStatus } from "../../types/rental";

const statusColors: Record<TRentalStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#2e9b72",
  cancelled: "#e35d6a",
  completed: "#316b86",
};

const formatCurrency = (amount: number) => `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | TRentalStatus>("all");
  const [search, setSearch] = useState("");
  const { data: vehicleResponse, isLoading: vehiclesLoading, isError: vehiclesError } = useGetAllVehiclesQuery({ limit: 100 });
  const { data: rentalResponse, isLoading: rentalsLoading, isError: rentalsError } = useGetAllRentalsQuery();

  const vehicles = vehicleResponse?.data.data ?? [];
  const rentals = useMemo(() => rentalResponse?.data ?? [], [rentalResponse]);
  const filteredRentals = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return rentals.filter((rental) => {
      const matchesStatus = statusFilter === "all" || rental.status === statusFilter;
      const matchesSearch = !searchTerm || [rental.vehicle?.name, rental.user?.fullName, rental.pickupLocation, rental.dropoffLocation].some((value) => value?.toLowerCase().includes(searchTerm));
      return matchesStatus && matchesSearch;
    });
  }, [rentals, search, statusFilter]);

  // Derive popular vehicles from rental frequency
  const popularVehicles = useMemo(() => {
    const vehicleBookingCounts: Record<string, { count: number; vehicle: any }> = {};
    rentals.forEach((rental) => {
      if (rental.vehicle?._id) {
        if (!vehicleBookingCounts[rental.vehicle._id]) {
          vehicleBookingCounts[rental.vehicle._id] = { count: 0, vehicle: rental.vehicle };
        }
        vehicleBookingCounts[rental.vehicle._id].count += 1;
      }
    });
    return Object.values(vehicleBookingCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({ ...item.vehicle, bookingCount: item.count }));
  }, [rentals]);

  const statusData = (Object.keys(statusColors) as TRentalStatus[]).map((status) => ({
    name: status,
    value: rentals.filter((rental) => rental.status === status).length,
  }));
  const trendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => ({
      month,
      bookings: rentals.filter((rental) => new Date(rental.createdAt ?? rental.pickupDate).getMonth() === index).length,
    }));
  }, [rentals]);

  const loading = vehiclesLoading || rentalsLoading;
  if (loading) return <div className="dashboard-state"><Spin size="large" /><span>Loading your operations data...</span></div>;
  if (vehiclesError || rentalsError) return <Alert type="error" showIcon message="Dashboard data could not be loaded" description="Check the API connection and refresh the page." />;

  return (
    <main className="dashboard-page">
      <div className="dashboard-heading"><div><p className="eyebrow">DRIVEPILOT / ADMIN</p><h1>Good morning, admin.</h1><p>Here is what is happening across your rental fleet today.</p></div><div className="dashboard-date">Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div></div>
      
      {/* Top Stat Cards: 1 Large + 3 Small */}
      <section className="stat-grid-layout">
        <article className="stat-card stat-card-primary">
          <span>Total vehicles</span>
          <strong>{vehicleResponse?.data.meta.total ?? vehicles.length}</strong>
          <small>Fleet size</small>
        </article>
        <div className="stat-cards-small-group">
          <article className="stat-card stat-card-small">
            <span>Available now</span>
            <strong>{vehicles.filter((vehicle) => vehicle.isAvailable).length}</strong>
            <small>Ready to rent</small>
          </article>
          <article className="stat-card stat-card-small">
            <span>Total rentals</span>
            <strong>{rentals.length}</strong>
            <small>{formatCurrency(rentals.reduce((sum, rental) => sum + rental.totalAmount, 0))}</small>
          </article>
          <article className="stat-card stat-card-small">
            <span>Pending rentals</span>
            <strong>{rentals.filter((rental) => rental.status === "pending").length}</strong>
            <small>Awaiting confirmation</small>
          </article>
        </div>
      </section>

      {/* Middle Section: Popular Vehicles + Recent Bookings */}
      <section className="dashboard-grid dashboard-grid-middle">
        <article className="dashboard-panel popular-vehicles-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">FLEET PERFORMANCE</p>
              <h2>Popular vehicles</h2>
            </div>
            <span className="panel-note">Top 5</span>
          </div>
          <div className="popular-vehicles-list">
            {popularVehicles.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No vehicle data yet" />
            ) : (
              <div className="vehicles-table">
                <table>
                  <tbody>
                    {popularVehicles.map((vehicle) => (
                      <tr key={vehicle._id}>
                        <td className="vehicle-name">
                          <strong>{vehicle.name ?? "Vehicle"}</strong>
                          <small>{vehicle.brand ?? "Brand"}</small>
                        </td>
                        <td className="vehicle-bookings">
                          <span className="booking-count">{vehicle.bookingCount ?? 0}</span>
                          <small>bookings</small>
                        </td>
                        <td className="vehicle-price">
                          <strong>{formatCurrency(vehicle.pricePerDay ?? 0)}</strong>
                          <small>per day</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-panel recent-bookings-panel">
          <div className="panel-heading panel-heading-table">
            <div>
              <p className="eyebrow">LATEST ACTIVITY</p>
              <h2>Recent bookings</h2>
            </div>
            <div className="table-filters">
              <Input allowClear placeholder="Search rentals" value={search} onChange={(event) => setSearch(event.target.value)} />
              <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All statuses" }, ...Object.keys(statusColors).map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))]} />
            </div>
          </div>
          {filteredRentals.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={rentals.length === 0 ? "No rentals yet" : "No rentals match these filters"} />
          ) : (
            <div className="rental-table-wrap">
              <table className="rental-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Route</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRentals.slice(0, 5).map((rental) => (
                    <tr key={rental._id}>
                      <td>
                        <strong>{rental.user?.fullName ?? "Customer"}</strong>
                        <small>{rental.user?.email ?? ""}</small>
                      </td>
                      <td>{rental.vehicle?.name ?? "Vehicle"}</td>
                      <td>
                        {rental.pickupLocation} <span className="route-arrow">to</span> {rental.dropoffLocation}
                      </td>
                      <td>
                        {new Date(rental.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        <span className="table-muted"> to {new Date(rental.dropoffDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </td>
                      <td>
                        <strong>{formatCurrency(rental.totalAmount)}</strong>
                      </td>
                      <td>
                        <span className={`status-badge status-${rental.status}`}>{rental.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      {/* Bottom Analytics Section */}
      <section className="dashboard-grid dashboard-grid-bottom">
        <article className="dashboard-panel trend-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ACTIVITY</p>
              <h2>Rental activity</h2>
            </div>
            <span className="panel-note">Bookings by month</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef654e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef654e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee7df" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#87908d", fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#87908d", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#ef654e" strokeWidth={3} fill="url(#bookingFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel status-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">FLEET PULSE</p>
              <h2>Rental status</h2>
            </div>
          </div>
          <div className="donut-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name as TRentalStatus]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-total">
              <strong>{rentals.length}</strong>
              <span>rentals</span>
            </div>
          </div>
          <div className="legend">
            {statusData.map((entry) => (
              <span key={entry.name}>
                <i style={{ background: statusColors[entry.name as TRentalStatus] }} />
                {entry.name}
                <b>{entry.value}</b>
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

export default AdminDashboard;
