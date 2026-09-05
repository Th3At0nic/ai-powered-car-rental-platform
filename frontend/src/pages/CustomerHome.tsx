import {
  ArrowRightOutlined,
  CalendarOutlined,
  CarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  MenuOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  StarFilled,
  UserOutlined,
} from "@ant-design/icons";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import VehicleCard from "../components/customer/VehicleCard";
import { useGetAllVehiclesQuery } from "../redux/features/vehicle/vehicleApi";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { currentUser, logoutUser } from "../redux/features/auth/authSlice";

const categories = ["Popular", "Large Car", "Small Car", "Exclusive Car"];
const testimonials = [
  [
    "Vikash Robert",
    "Frequent traveler",
    "The whole process was effortless. The car was spotless, comfortable, and ready exactly when promised.",
    "4.9",
  ],
  [
    "Maya Peterson",
    "Weekend explorer",
    "DrivePilot makes renting feel simple. I found the right car in minutes and the support was excellent.",
    "5.0",
  ],
  [
    "Daniel Lee",
    "Business traveler",
    "Reliable cars, clear pricing, and a genuinely smooth pickup experience. This is my go-to rental service.",
    "4.8",
  ],
];

function SearchField({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="search-field">
      <span className="search-icon">{icon}</span>
      <span>
        <small>{label}</small>
        {children}
      </span>
    </label>
  );
}

type SearchForm = {
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffDate: string;
};

const CustomerHome = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(currentUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("Popular");
  const [showAll, setShowAll] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchForm>({
    pickupLocation: "",
    pickupDate: "",
    pickupTime: "",
    dropoffLocation: "",
    dropoffDate: "",
  });
  const [submittedSearch, setSubmittedSearch] = useState<SearchForm | null>(
    null
  );
  const [searchError, setSearchError] = useState("");

  const { data, isLoading, isError } = useGetAllVehiclesQuery(
    submittedSearch
      ? {
          location: submittedSearch.pickupLocation || undefined,
          isAvailable: true,
          limit: 100,
        }
      : { limit: 100 }
  );

  const vehicles = data?.data?.data ?? [];
  const today = new Date().toISOString().split("T")[0];

  const updateSearchField = (field: keyof SearchForm, value: string) => {
    setSearchForm((current) => ({ ...current, [field]: value }));
    setSearchError("");
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchForm.pickupDate && searchForm.pickupDate < today) {
      setSearchError("Pick-up date cannot be in the past.");
      return;
    }

    if (
      searchForm.pickupDate &&
      searchForm.dropoffDate &&
      searchForm.dropoffDate < searchForm.pickupDate
    ) {
      setSearchError("Drop-off date cannot be before the pick-up date.");
      return;
    }

    setSubmittedSearch(searchForm);
    setShowAll(false);
    setSearchError("");
    document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleResetSearch = () => {
    setSearchForm({
      pickupLocation: "",
      pickupDate: "",
      pickupTime: "",
      dropoffLocation: "",
      dropoffDate: "",
    });
    setSubmittedSearch(null);
    setSearchError("");
    setShowAll(false);
  };

  const filtered = vehicles.filter((vehicle) => {
    if (category === "Popular") {
      return true;
    }

    if (category === "Large Car") {
      return ["suv", "van"].includes(vehicle.category.toLowerCase());
    }

    if (category === "Small Car") {
      return ["sedan", "hatchback"].includes(vehicle.category.toLowerCase());
    }

    if (category === "Exclusive Car") {
      return ["luxury", "coupe"].includes(vehicle.category.toLowerCase());
    }

    return true;
  });

  const visible = filtered.slice(0, showAll ? 100 : 8);

  return (
    <div className="customer-home">
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
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#deals">Rental Deals</a>
          <a href="#why-us">Why Choose Us</a>
          <a href="#testimonials">Testimonial</a>
          {user?.role === "user" ? (
            <>
              <Link to="/my-rentals">My Rentals</Link>
              <button className="nav-logout" onClick={() => dispatch(logoutUser())}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login" className="login-button">
                <UserOutlined /> Login
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">YOUR JOURNEY, OUR PRIORITY</p>
            <h1>
              Fast and easy way to <em>rent a car.</em>
            </h1>
            <p className="hero-description">
              Find the perfect ride for every road ahead. Book trusted vehicles
              in a few simple clicks and get moving with confidence.
            </p>
            <div className="hero-actions">
              <a href="#deals" className="primary-button">
                Booking Now <ArrowRightOutlined />
              </a>
              <a href="#deals" className="text-button">
                See all cars <ArrowRightOutlined />
              </a>
            </div>
            <p className="hero-proof">
              <strong>4.9/5</strong> from 2,000+ happy drivers
            </p>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=90"
              alt="Silver sports car ready for rental"
            />
            <div className="hero-badge">
              Drive with ease<strong>Premium fleet</strong>
            </div>
          </div>
            <form className="booking-panel" onSubmit={handleSearch}>
            <div className="booking-heading">
              <strong>Plan your trip</strong>
              <small>Find your perfect ride</small>
            </div>
            <SearchField
              icon={<EnvironmentOutlined />}
              label="Pick-up location"
              >
                <select
                  value={searchForm.pickupLocation}
                  onChange={(event) =>
                    updateSearchField("pickupLocation", event.target.value)
                  }
                  aria-label="Pick-up location"
                >
                  <option value="">Select your city</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                </select>
              </SearchField>
            <SearchField
              icon={<CalendarOutlined />}
              label="Pick-up date"
              >
                <input
                  type="date"
                  value={searchForm.pickupDate}
                  min={today}
                  onChange={(event) =>
                    updateSearchField("pickupDate", event.target.value)
                  }
                  aria-label="Pick-up date"
                />
              </SearchField>
            <SearchField
              icon={<ClockCircleOutlined />}
              label="Pick-up time"
              >
                <input
                  type="time"
                  value={searchForm.pickupTime}
                  onChange={(event) =>
                    updateSearchField("pickupTime", event.target.value)
                  }
                  aria-label="Pick-up time"
                />
              </SearchField>
            <span className="booking-divider" />
            <SearchField
              icon={<EnvironmentOutlined />}
              label="Drop-off location"
              >
                <select
                  value={searchForm.dropoffLocation}
                  onChange={(event) =>
                    updateSearchField("dropoffLocation", event.target.value)
                  }
                  aria-label="Drop-off location"
                >
                  <option value="">Select your city</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                </select>
              </SearchField>
            <SearchField
              icon={<CalendarOutlined />}
              label="Drop-off date"
              >
                <input
                  type="date"
                  value={searchForm.dropoffDate}
                  min={searchForm.pickupDate || today}
                  onChange={(event) =>
                    updateSearchField("dropoffDate", event.target.value)
                  }
                  aria-label="Drop-off date"
                />
              </SearchField>
              <button className="search-button" type="submit">
              Search <SearchOutlined />
            </button>
              {searchError && (
                <p className="booking-error" role="alert">
                  {searchError}
                </p>
              )}
            </form>
        </section>
        <section className="section-shell process-section" id="how-it-works">
          <div className="section-intro">
            <p className="eyebrow">SIMPLE AS 1, 2, 3</p>
            <h2>How it works</h2>
            <p>
              From searching to steering, we make every step of your rental
              journey effortless.
            </p>
          </div>
          <div className="process-grid">
            {[
              [
                <EnvironmentOutlined />,
                "Choose Location",
                "Pick a city and browse rides ready near you.",
              ],
              [
                <CalendarOutlined />,
                "Pick-up Date",
                "Select the dates and times that suit your plans.",
              ],
              [
                <CarOutlined />,
                "Book your car",
                "Confirm your ride and hit the road with ease.",
              ],
            ].map(([icon, title, text], index) => (
              <article className="process-step" key={title as string}>
                <div className="process-icon">{icon}</div>
                <span className="step-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                {index < 2 && <span className="process-line" />}
              </article>
            ))}
          </div>
        </section>
        <section className="deals-section" id="deals">
          <div className="section-shell">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">FIND YOUR MATCH</p>
                <h2>Most popular car rental deals</h2>
                <p>
                  Explore our handpicked fleet, made for every kind of journey.
                </p>
              </div>
              <a href="#deals" className="outline-button">
                View all cars <ArrowRightOutlined />
              </a>
            </div>
            <div className="category-tabs">
              {categories.map((item) => (
                <button
                  className={category === item ? "active" : ""}
                  onClick={() => {
                    setCategory(item);
                    setShowAll(false);
                  }}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            {isLoading ? (
              <div className="vehicle-state">Loading your next ride...</div>
            ) : isError ? (
              <div className="vehicle-state">
                We could not load the fleet right now. Please try again shortly.
              </div>
            ) : visible.length ? (
              <div className="vehicle-grid">
                {visible.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="vehicle-state">
                <p>
                  {submittedSearch
                    ? "No vehicles found for your selected location."
                    : "No vehicles are available for this category yet."}
                </p>
                {submittedSearch && (
                  <button
                    className="show-more"
                    type="button"
                    onClick={handleResetSearch}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
            {submittedSearch && filtered.length > 0 && (
              <button
                className="show-more"
                type="button"
                onClick={handleResetSearch}
              >
                Clear search
              </button>
            )}
            {filtered.length > 8 && (
              <button
                type="button"
                className="show-more"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show fewer cars" : "Show more cars"}
              </button>
            )}
          </div>
        </section>
        <section className="section-shell why-section" id="why-us">
          <div className="section-intro">
            <p className="eyebrow">THE DRIVEPILOT DIFFERENCE</p>
            <h2>Why choose us</h2>
            <p>More than a rental. A better way to move through the world.</p>
          </div>
          <div className="why-content">
            <div className="why-image">
              <img
                src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85"
                alt="Driver beside a modern car"
              />
              <span>
                Made for the road ahead <ArrowRightOutlined />
              </span>
            </div>
            <div className="benefit-list">
              {[
                [
                  <UserOutlined />,
                  "Customer support",
                  "Real people are here to help, before, during, and after your trip.",
                ],
                [
                  <SafetyCertificateOutlined />,
                  "Best price guaranteed",
                  "Transparent pricing and thoughtfully selected vehicles, always.",
                ],
                [
                  <EnvironmentOutlined />,
                  "Many locations",
                  "Find a convenient pickup point in the city or at the airport.",
                ],
              ].map(([icon, title, text]) => (
                <article className="benefit" key={title as string}>
                  <div className="benefit-icon">{icon}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <CheckCircleFilled className="benefit-check" />
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section-shell promo-section">
          <div className="promo-card promo-one">
            <p className="eyebrow">WEEKEND READY</p>
            <h3>
              Make more room
              <br />
              for the good stuff.
            </h3>
            <a href="#deals">
              Explore the fleet <ArrowRightOutlined />
            </a>
          </div>
          <div className="promo-card promo-two">
            <p className="eyebrow">DRIVE YOUR WAY</p>
            <h3>
              Your next story
              <br />
              starts here.
            </h3>
            <a href="#deals">
              Find your car <ArrowRightOutlined />
            </a>
          </div>
        </section>
        <section className="testimonial-section" id="testimonials">
          <div className="section-shell">
            <div className="section-intro">
              <p className="eyebrow">REAL STORIES</p>
              <h2>
                Trusted by thousands of
                <br />
                <em>happy customers</em>
              </h2>
              <p>
                The best journeys are the ones you remember. Here is what our
                drivers say.
              </p>
            </div>
            <div className="testimonial-grid">
              {testimonials.map(([name, role, text, rating]) => (
                <article className="testimonial-card" key={name}>
                  <div className="quote-mark">“</div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <StarFilled key={item} />
                    ))}{" "}
                    <span>{rating}</span>
                  </div>
                  <p>{text}</p>
                  <div className="testimonial-person">
                    <span>{name.charAt(0)}</span>
                    <div>
                      <strong>{name}</strong>
                      <small>{role}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="carousel-controls">
              <span className="carousel-dots">
                <i className="active" />
                <i />
                <i />
                <i />
              </span>
              <span>
                <button aria-label="Previous testimonial">←</button>
                <button aria-label="Next testimonial">→</button>
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main section-shell">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-mark">
                <CarOutlined />
              </span>
              Drive<span>Pilot</span>
            </Link>
            <p>
              Move freely. Go further.
              <br />
              Your journey starts with us.
            </p>
            <div className="socials">
              <a href="#footer" aria-label="Facebook">
                <FacebookFilled />
              </a>
              <a href="#footer" aria-label="Instagram">
                <InstagramFilled />
              </a>
              <a href="#footer" aria-label="LinkedIn">
                <LinkedinFilled />
              </a>
            </div>
          </div>
          {[
            ["About", "How it works", "Rental deals", "Why choose us"],
            ["Community", "Events", "Blog", "Podcast"],
            ["Socials", "Instagram", "Twitter", "LinkedIn"],
          ].map(([heading, ...links]) => (
            <div className="footer-column" key={heading}>
              <h4>{heading}</h4>
              {links.map((link) => (
                <a href="#footer" key={link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom section-shell">
          <span>© 2026 DrivePilot. All rights reserved.</span>
          <span>
            <a href="#footer">Privacy Policy</a>
            <a href="#footer">Terms & Conditions</a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;
