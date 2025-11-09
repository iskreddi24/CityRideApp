import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>🚗 CityRide Connect</h3>
          <p>Making daily rides in Hyderabad smarter, safer, and shared.</p>
        </div>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CityRide Connect. All rights reserved.</p>
      </div>
    </footer>
  );
}
