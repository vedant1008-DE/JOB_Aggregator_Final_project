import './Loader.css';

function Loader() {
  return (
    <div className="loader">
      <div className="loader-spinner"></div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card"></div>
      ))}
    </div>
  );
}

export default Loader;
