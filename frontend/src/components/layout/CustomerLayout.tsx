import {
  CarOutlined,
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { currentUser, logoutUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

const CustomerLayout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(currentUser);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="customer-home">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark"><CarOutlined /></span>
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

      <Outlet />

      <footer className="site-footer">
        <div className="footer-main section-shell">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-mark"><CarOutlined /></span>
              Drive<span>Pilot</span>
            </Link>
            <p>Move freely. Go further.<br />Your journey starts with us.</p>
            <div className="socials">
              <a href="#footer" aria-label="Facebook"><FacebookFilled /></a>
              <a href="#footer" aria-label="Instagram"><InstagramFilled /></a>
              <a href="#footer" aria-label="LinkedIn"><LinkedinFilled /></a>
            </div>
          </div>
          {[
            ["About", "How it works", "Rental deals", "Why choose us"],
            ["Community", "Events", "Blog", "Podcast"],
            ["Socials", "Instagram", "Twitter", "LinkedIn"],
          ].map(([heading, ...links]) => (
            <div className="footer-column" key={heading}>
              <h4>{heading}</h4>
              {links.map((link) => <a href="#footer" key={link}>{link}</a>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom section-shell">
          <span>© 2026 DrivePilot. All rights reserved.</span>
          <span><a href="#footer">Privacy Policy</a><a href="#footer">Terms & Conditions</a></span>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;