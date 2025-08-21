import React, { forwardRef, useState, useEffect } from 'react';
import { decode } from 'html-entities';
import { Link } from "react-router-dom";

const Pagination = forwardRef(({ metas, onClick, onPerPageChange, className = '' }, ref) => {
  // Handle both old and new metadata structures
  const totalRows = typeof metas.total === 'string' ? parseInt(metas.total) : metas.total;
  const perPage = metas.per_page || 10;
  const currentPage = metas.current_page || 1;
  const lastPage = metas.last_page || 1;
  
  // State for rows per page selector
  const [selectedPerPage, setSelectedPerPage] = useState(perPage);
  
  // Update selectedPerPage when perPage prop changes
  useEffect(() => {
    setSelectedPerPage(perPage);
  }, [perPage]);
  

  
  // Available rows per page options
  const perPageOptions = [10, 25, 50, 100];

  const goToPage = (event, page) => {
    event.preventDefault();
    if (page && page !== currentPage) {
      // Pass the page number directly instead of a URL
      onClick(page);
    }
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

  // Generate pagination links with max 8 page numbers
  const generatePaginationLinks = () => {
    const links = [];
    const maxVisiblePages = 6;
    
    if (lastPage <= maxVisiblePages) {
      // Show all pages if total pages is 8 or less
      for (let i = 1; i <= lastPage; i++) {
        links.push({ page: i, label: i.toString(), active: i === currentPage });
      }
    } else {
      // Show limited pages with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      // Always show first page
      links.push({ page: 1, label: '1', active: currentPage === 1 });
      
      if (currentPage <= halfVisible + 1) {
        // Show pages 2 to maxVisiblePages-1, then ellipsis, then last page
        for (let i = 2; i <= maxVisiblePages - 1; i++) {
          links.push({ page: i, label: i.toString(), active: i === currentPage });
        }
        links.push({ page: null, label: '...', active: false });
        links.push({ page: lastPage, label: lastPage.toString(), active: false });
      } else if (currentPage >= lastPage - halfVisible) {
        // Show first page, ellipsis, then pages from lastPage-maxVisiblePages+2 to lastPage
        links.push({ page: null, label: '...', active: false });
        for (let i = lastPage - maxVisiblePages + 2; i <= lastPage; i++) {
          links.push({ page: i, label: i.toString(), active: i === currentPage });
        }
      } else {
        // Show first page, ellipsis, current page and surrounding pages, ellipsis, last page
        links.push({ page: null, label: '...', active: false });
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          links.push({ page: i, label: i.toString(), active: i === currentPage });
        }
        links.push({ page: null, label: '...', active: false });
        links.push({ page: lastPage, label: lastPage.toString(), active: false });
      }
    }
    
    return links;
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
          {/* Previous button */}
          <li className={`pagination-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <Link
              className="pagination-link"
              to="#"
              onClick={(event) => goToPage(event, currentPage - 1)}
              aria-label="Previous"
            >
              Previous
            </Link>
          </li>
          
          {/* Page numbers */}
          {generatePaginationLinks().map((link, index) => {
            const isActive = link.active;
            const isEllipsis = link.label === '...';
            
            return (
              <li
                key={index}
                className={`pagination-item ${isActive ? 'active' : ''} ${isEllipsis ? 'disabled' : ''}`}
              >
                {isEllipsis ? (
                  <span className="pagination-link">{link.label}</span>
                ) : (
                  <Link
                    className="pagination-link"
                    to="#"
                    onClick={(event) => goToPage(event, link.page)}
                    aria-label={link.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
          
          {/* Next button */}
          <li className={`pagination-item ${currentPage === lastPage ? 'disabled' : ''}`}>
            <Link
              className="pagination-link"
              to="#"
              onClick={(event) => goToPage(event, currentPage + 1)}
              aria-label="Next"
            >
              Next
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
});

export default Pagination;