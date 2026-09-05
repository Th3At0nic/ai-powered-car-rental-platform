import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  MenuOutlined,
  SettingOutlined,
  StarFilled,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetSingleVehicleQuery } from "../redux/features/vehicle/vehicleApi";

const VehicleDetails = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isLoading, isError } = useGetSingleVehicleQuery(
    vehicleId ?? "",
    { skip: !vehicleId },
  );

  const vehicle = data?.data;

  if (isLoading) {
    return (
      <div className="vehicle-details-page">
        <CustomerHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main className="vehicle-details-shell section-shell">
          <div className="details-skeleton details-skeleton-image" />
          <div className="details-skeleton-content">
            <div className="details-skeleton details-skeleton-line short" />
            <div className="details-skeleton details-skeleton-line title" />
            <div className="details-skeleton details-skeleton-line" />
            <div className="details-skeleton details-skeleton-specs" />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <VehicleDetailsMessage
        title="We couldn't load this vehicle right now."
        description="Please return to the fleet and choose another ride."
      />
    );
  }

  if (!vehicle) {
    return (
      <VehicleDetailsMessage
        title="Vehicle not found"
        description="This vehicle may have been removed or the link may be incorrect."
      />
    );
  }

  return (
    <div className="vehicle-details-page">
      <CustomerHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="vehicle-details-shell section-shell">
        <Link to="/" className="details-back-link">
          <ArrowLeftOutlined /> Back to rental deals
        </Link>

        <div className="details-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{vehicle.category}</span>
          <span>/</span>
          <strong>{vehicle.name}</strong>
        </div>

        <section className="vehicle-details-card">
          <div className="details-image-wrap">
            <img src={vehicle.image} alt={vehicle.name} className="details-image" />
          </div>

          <div className="details-info">
            <div className="details-heading-row">
              <div>
                <p className="eyebrow">{vehicle.brand}</p>
                <h1>{vehicle.name}</h1>
              </div>
              <div className="details-rating">
                <StarFilled /> <strong>{vehicle.rating}</strong>
              </div>
            </div>

            <div className="details-meta">
              <span>{vehicle.category}</span>
              <span>
                <EnvironmentOutlined /> {vehicle.location}
              </span>
            </div>

            <div className="details-price">
              <strong>${vehicle.pricePerDay}</strong>
              <span>/ day</span>
            </div>

            <div className="details-availability">
              <CheckCircleFilled />
              {vehicle.isAvailable ? "Available for booking" : "Currently unavailable"}
            </div>

            <div className="vehicle-spec-grid">
              <VehicleSpec icon={<UserOutlined />} label="Seats" value={`${vehicle.seats}`} />
              <VehicleSpec
                icon={<SettingOutlined />}
                label="Transmission"
                value={vehicle.transmission}
              />
              <VehicleSpec
                icon={<ThunderboltOutlined />}
                label="Fuel type"
                value={vehicle.fuelType}
              />
              <VehicleSpec
                icon={<EnvironmentOutlined />}
                label="Location"
                value={vehicle.location}
              />
            </div>

            <button
              type="button"
              className="details-cta primary-button"
              disabled={!vehicle.isAvailable}
            >
              {vehicle.isAvailable ? "Rent This Car" : "Currently Unavailable"}
            </button>
          </div>
        </section>

        <section className="details-lower-grid">
          <article className="details-copy-block">
            <p className="eyebrow">THE RIDE</p>
            <h2>Ready for the road ahead</h2>
            <p>{vehicle.description}</p>
          </article>
          <article className="details-copy-block">
            <p className="eyebrow">WHAT'S INCLUDED</p>
            <h2>Features</h2>
            {vehicle.features.length ? (
              <ul className="details-features">
                {vehicle.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircleFilled /> {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No additional features have been listed for this vehicle.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
};

function CustomerHeader({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <CarOutlined />
        </span>
        Drive<span>Pilot</span>
      </Link>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <MenuOutlined />
      </button>
      <nav className={menuOpen ? "site-nav is-open" : "site-nav"}>
        <Link to="/#home">Home</Link>
        <Link to="/#how-it-works">How It Works</Link>
        <Link to="/#deals">Rental Deals</Link>
        <Link to="/#why-us">Why Choose Us</Link>
        <Link to="/register">Register</Link>
        <Link to="/login" className="login-button">
          <UserOutlined /> Login
        </Link>
      </nav>
    </header>
  );
}

function VehicleSpec({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="vehicle-spec">
      <span className="vehicle-spec-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function VehicleDetailsMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="vehicle-details-page">
      <CustomerHeader menuOpen={false} setMenuOpen={() => undefined} />
      <main className="details-message section-shell">
        <div className="details-message-icon">
          <CarOutlined />
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link to="/" className="primary-button">
          <ArrowLeftOutlined /> Back to homepage
        </Link>
      </main>
    </div>
  );
}

export default VehicleDetails;