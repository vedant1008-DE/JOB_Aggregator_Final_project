import logo from '../assets/logo.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <img src={logo} alt="HirePulse" className="footer-logo-img" />
        <span className="footer-text">Job Aggregator</span>
      </div>
    </footer>
  );
}

export default Footer;
