import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateRentalMutation } from "../redux/features/rental/rentalApi";
import { useGetSingleVehicleQuery } from "../redux/features/vehicle/vehicleApi";

type BookingForm = {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
};

const getToday = () => {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
};

const getNextDate = (date: string) => {
  if (!date) return getToday();
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const month = `${nextDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${nextDate.getDate()}`.padStart(2, "0");
  return `${nextDate.getFullYear()}-${month}-${day}`;
};

const getRentalDays = (pickupDate: string, dropoffDate: string) => {
  if (!pickupDate || !dropoffDate) return 0;
  return Math.round(
    (new Date(`${dropoffDate}T00:00:00`).getTime() -
      new Date(`${pickupDate}T00:00:00`).getTime()) /
      86400000,
  );
};

const getErrorMessage = (error: unknown) => {
  const rawMessage =
    typeof error === "object" && error !== null && "data" in error
      ? (error as { data?: { message?: string } }).data?.message
      : undefined;
  const message = rawMessage?.toLowerCase() ?? "";

  if (message.includes("unavailable") || message.includes("already booked")) {
    return "Sorry, this vehicle is already booked for the selected dates.";
  }
  if (message.includes("date")) {
    return "Please choose valid rental dates and try again.";
  }
  if (message.includes("unauthorized") || message.includes("token")) {
    return "Your session has expired. Please log in again.";
  }
  return "Unable to create your rental. Please try again.";
};

const Booking = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<BookingForm>({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    dropoffDate: "",
  });
  const [createRental, { isLoading: isSubmitting }] = useCreateRentalMutation();
  const { data, isLoading, isError } = useGetSingleVehicleQuery(vehicleId ?? "", {
    skip: !vehicleId,
  });
  const vehicle = data?.data;
  const today = getToday();
  const rentalDays = getRentalDays(form.pickupDate, form.dropoffDate);

  const updateField = (field: keyof BookingForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "pickupDate" && current.dropoffDate && value >= current.dropoffDate
        ? { dropoffDate: "" }
        : {}),
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleId || !vehicle || rentalDays < 1) return;

    try {
      await createRental({ vehicle: vehicleId, ...form }).unwrap();
      toast.success("Rental request created successfully.", { duration: 2500 });
      navigate("/my-rentals");
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 3000 });
    }
  };

  if (isLoading) {
    return <BookingMessage title="Loading your vehicle..." description="Preparing your booking details." />;
  }

  if (isError || !vehicle) {
    return <BookingMessage title="Vehicle not found" description="Please return to the fleet and choose another ride." />;
  }

  return (
    <div className="booking-page">
      <main className="booking-shell section-shell">
        <Link to={`/vehicles/${vehicle._id}`} className="details-back-link">
          <ArrowLeftOutlined /> Back to vehicle details
        </Link>
        <div className="details-breadcrumb">
          <Link to="/">Home</Link><span>/</span><span>Book your ride</span>
        </div>
        <div className="booking-layout">
          <section className="booking-summary">
            <img src={vehicle.image} alt={vehicle.name} className="booking-summary-image" />
            <div className="booking-summary-content">
              <p className="eyebrow">YOUR SELECTED RIDE</p>
              <h1>{vehicle.name}</h1>
              <p className="booking-summary-brand">{vehicle.brand} · {vehicle.category}</p>
              <div className="booking-summary-price"><strong>৳{vehicle.pricePerDay.toLocaleString()}</strong><span>/ day</span></div>
              <div className="booking-summary-status">
                <CheckCircleFilled /> {vehicle.isAvailable ? "Available for booking" : "Currently unavailable"}
              </div>
              <div className="booking-summary-specs">
                <BookingSpec icon={<EnvironmentOutlined />} label="Location" value={vehicle.location} />
                <BookingSpec icon={<UserOutlined />} label="Seats" value={`${vehicle.seats}`} />
                <BookingSpec icon={<SettingOutlined />} label="Transmission" value={vehicle.transmission} />
                <BookingSpec icon={<ThunderboltOutlined />} label="Fuel type" value={vehicle.fuelType} />
              </div>
            </div>
          </section>

          <section className="booking-form-card">
            <p className="eyebrow">RESERVE YOUR RIDE</p>
            <h2>Set your rental details</h2>
            <p className="booking-form-intro">Choose where and when you want to collect this vehicle.</p>
            <form onSubmit={onSubmit} className="booking-form">
              <label>Pickup location<input required value={form.pickupLocation} onChange={(event) => updateField("pickupLocation", event.target.value)} placeholder="e.g. Dhaka" /></label>
              <label>Dropoff location<input required value={form.dropoffLocation} onChange={(event) => updateField("dropoffLocation", event.target.value)} placeholder="e.g. Dhaka" /></label>
              <label>Pickup date<input required type="date" min={today} value={form.pickupDate} onChange={(event) => updateField("pickupDate", event.target.value)} /></label>
              <label>Dropoff date<input required type="date" min={getNextDate(form.pickupDate)} value={form.dropoffDate} onChange={(event) => updateField("dropoffDate", event.target.value)} /></label>

              {rentalDays > 0 && (
                <div className="booking-estimate">
                  <span>{rentalDays} days × ৳{vehicle.pricePerDay.toLocaleString()}/day</span>
                  <strong>Estimated total: ৳{(rentalDays * vehicle.pricePerDay).toLocaleString()}</strong>
                </div>
              )}
              <button className="primary-button booking-submit" type="submit" disabled={isSubmitting || !vehicle.isAvailable}>
                {isSubmitting ? "Creating rental..." : "Confirm rental"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

function BookingSpec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="booking-spec"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>;
}

function BookingMessage({ title, description }: { title: string; description: string }) {
  return <div className="booking-page"><main className="details-message section-shell"><div className="details-message-icon"><CarOutlined /></div><h1>{title}</h1><p>{description}</p><Link to="/" className="primary-button"><ArrowLeftOutlined /> Back to homepage</Link></main></div>;
}

export default Booking;