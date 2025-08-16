import React, { forwardRef, useState } from 'react';
import { decode } from 'html-entities';
import { Link } from "react-router-dom";

const Pagination = forwardRef(({ metas, onClick, onPerPageChange, className = '' }, ref) => {
  const { total: totalRows, links: paginationLinks, per_page: perPage, current_page: currentPage } = metas;
  
  // State for rows per page selector
  const [selectedPerPage, setSelectedPerPage] = useState(perPage || 10);
  
  // Available rows per page options
  const perPageOptions = [10, 25, 50, 100];

  const goToPage = (event, url) => {
    event.preventDefault();
    if (url) onClick(url);
  };

  const handlePerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value);
    setSelectedPerPage(newPerPage);
    if (onPerPageChange) {
      onPerPageChange(newPerPage);
    }
  };

  const getPageInfo = () => {
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalRows);
    return `${start}-${end} of ${totalRows}`;
  };

  return (
    <div className={`pagination-modern ${className}`}>
      <div className="pagination-left">
        <div className="rows-per-page">
          <label htmlFor="rows-per-page" className="rows-per-page-label">
            Rows per page:
          </label>
          <select
            id="rows-per-page"
            className="rows-per-page-select"
            value={selectedPerPage}
            onChange={handlePerPageChange}
          >
            {perPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="pagination-info">
          {getPageInfo()}
        </div>
      </div>

      <div className="pagination-right">
        <ul className="pagination-controls">
          {paginationLinks?.map((link, index) => {
            const isDisabled = !link.url;
            const isActive = link.active;
            const isEllipsis = link.label === '...';
            
            return (
              <li
                key={index}
                className={`pagination-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              >
                {isEllipsis ? (
                  <span className="pagination-link">{link.label}</span>
                ) : (
                  <Link
                    className="pagination-link"
                    to="#"
                    onClick={(event) => goToPage(event, link.url)}
                    aria-label={link.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {decode(link.label)}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

export default Pagination;