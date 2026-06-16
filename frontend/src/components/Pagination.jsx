import './Pagination.css';

function Pagination({ currentPage, hasNextPage, onPageChange }) {
  return (
    <div className="pagination fade-in">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      <span className="pagination-info">Page {currentPage}</span>
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
