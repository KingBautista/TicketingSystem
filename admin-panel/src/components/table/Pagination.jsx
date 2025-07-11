import React, { forwardRef } from 'react';
import { decode } from 'html-entities';
import { Link } from "react-router-dom";

const Pagination = forwardRef(({ metas, onClick, className = '' }, ref) => {
  const { total: totalRows, links: paginationLinks, per_page: perPage, current_page: currentPage } = metas;

  const goToPage = (event, url) => {
    event.preventDefault();
    if (url) onClick(url);
  };

  const getPageInfo = () => {
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalRows);
    return `Showing ${start} to ${end} of ${totalRows} entries`;
  };

  return (
    <nav className={`container-fluid ${className}`}>
      <div className="row align-items-center">
        {/* Page Info - Align to the left */}
        <div className="col-12 col-md-6 d-flex justify-content-start align-items-center mt-1">
          <div className="pagination-info">
            {getPageInfo()}
          </div>
        </div>

        {/* Pagination - Align to the right */}
        <div className="col-12 col-md-6 d-flex justify-content-end">
          <ul className="pagination mb-0">
            {paginationLinks?.map((link, index) => {
              const isDisabled = !link.url;
              const isActive = link.active;
              const isEllipsis = link.label === '...';
              
              return (
                <li
                  key={index}
                  className={`page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                >
                  {isEllipsis ? (
                    <span className="page-link">{link.label}</span>
                  ) : (
                    <Link
                      className="page-link"
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
    </nav>
  );
});

export default Pagination;