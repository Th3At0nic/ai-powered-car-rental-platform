import { CarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Alert, Empty, Spin, Tag } from "antd";
import { Link } from "react-router-dom";
import { useGetMyRentalsQuery } from "../redux/features/rental/rentalApi";

const statusColors = {
  pending: "gold",
  confirmed: "green",
  cancelled: "red",
  completed: "blue",
} as const;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const MyRentals = () => {
  const { data, isLoading, isError, refetch } = useGetMyRentalsQuery();
  const rentals = data?.data ?? [];

  return (
    <main className="rental-page">
      <section className="rental-heading">
        <p className="eyebrow">YOUR DRIVEPILOT ACCOUNT</p>
        <h1>My rentals</h1>
        <p>Keep track of your upcoming drives and rental history.</p>
        <div className="rental-actions">
          <Link to="/#deals" className="primary-button">Browse Cars</Link>
        </div>
      </section>

      {isLoading && (
        <div className="rental-state">
          <Spin size="large" />
          <p>Loading your rentals...</p>
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          showIcon
          message="We could not load your rentals."
          description="Please try again in a moment."
          action={<button className="retry-button" onClick={() => refetch()}>Try again</button>}
        />
      )}

      {!isLoading && !isError && rentals.length === 0 && (
        <div className="rental-state rental-empty">
          <Empty description="You have no rentals yet" />
          <a href="/#deals" className="primary-button">Browse vehicles</a>
        </div>
      )}

      {!isLoading && !isError && rentals.length > 0 && (
        <section className="rental-list" aria-label="Your rentals">
          {rentals.map((rental) => (
            <article className="rental-card" key={rental._id}>
              <img src={rental.vehicle.image} alt={rental.vehicle.name} />
              <div className="rental-card-body">
                <div className="rental-card-topline">
                  <div>
                    <p className="rental-brand">{rental.vehicle.brand}</p>
                    <h2>{rental.vehicle.name}</h2>
                  </div>
                  <Tag color={statusColors[rental.status]}>{rental.status}</Tag>
                </div>
                <div className="rental-route">
                  <span><EnvironmentOutlined /> {rental.pickupLocation}</span>
                  <span><CarOutlined /> {rental.dropoffLocation}</span>
                </div>
                <div className="rental-details">
                  <span><small>Dates</small>{formatDate(rental.pickupDate)} - {formatDate(rental.dropoffDate)}</span>
                  <span><small>Total days</small>{rental.totalDays}</span>
                  <span><small>Total amount</small>${rental.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default MyRentals;