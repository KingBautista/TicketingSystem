import { forwardRef } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Attachments = forwardRef(({ thumbnails, checked, onClick, isLoadingMore }, ref) => {
  
  const renderThumbnail = (thumbnail, index) => {
    const { id, thumbnail_url, file_type, file_name, height, width } = thumbnail;
    const isPortrait = height > width;
    const isFileTypeMedia = file_type.startsWith('application') || file_type.startsWith('audio');
    
    // Create unique key to prevent duplicates
    const uniqueKey = `thumbnail-${id}-${index}`;
    
    return (
      <li 
        key={uniqueKey}
        tabIndex={id}
        className={`attachment ${checked.includes(id) ? 'selected details' : ''}`}
        style={{
          opacity: 0,
          transform: 'translateY(20px)',
          animation: `fadeInUp 0.5s ease-out ${index * 100}ms forwards`
        }}
        onClick={(ev) => {
          ev.preventDefault();
          onClick(thumbnail);
        }}>
        <div className="attachment-preview">
          <div className="thumbnail">
            <div className={isPortrait ? 'portrait' : 'centered'}>
              <LazyLoadImage 
                src={thumbnail_url} 
                alt={file_name || 'Media thumbnail'}
                effect="blur"
                style={{
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onLoad={(e) => {
                  if (e.target) {
                    e.target.style.opacity = '1';
                  }
                }}
                onError={(e) => {
                  console.log('Image load error for:', thumbnail_url);
                  e.target.style.opacity = '0.5';
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMzUgNzVMMTIwIDYwSDE4MEwxNjUgNzVMMTgwIDkwSDEyMEwxMzUgNzVaIiBmaWxsPSIjQ0NDIi8+Cjwvdmc+';
                }}
                placeholder={
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d',
                    fontSize: '12px'
                  }}>
                    Loading...
                  </div>
                }
              />
            </div>
            {isFileTypeMedia && (
              <div className="filename">
                <div>{file_name}</div>
              </div>
            )}
          </div>
        </div>
        <button type="button" className="check" tabIndex="-1">
          <span className="media-modal-icon"></span>
        </button>
      </li>
    );
  };

  // Loading skeleton for smooth transitions
  const renderSkeleton = (index) => (
    <li 
      key={`skeleton-${index}`}
      className="attachment skeleton-item"
      style={{
        opacity: 0,
        animation: `fadeInUp 0.3s ease-out ${index * 50}ms forwards`
      }}
    >
      <div className="attachment-preview">
        <div className="thumbnail">
          <div className="skeleton-placeholder"></div>
        </div>
      </div>
    </li>
  );

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .attachments {
          padding: 2px;
          margin: 0;
          list-style: none;
          transition: all 0.3s ease;
          width: 100%;
          /* Remove grid layout to work with existing float layout */
        }

        .attachment {
          position: relative;
          float: left;
          padding: 8px;
          margin: 0;
          color: #3c434a;
          cursor: pointer;
          list-style: none;
          text-align: center;
          user-select: none;
          width: 11.11%;
          box-sizing: border-box;
          /* Keep your existing sizing but add transitions */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .attachment:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .attachment.selected {
          border-color: #007bff;
          box-shadow: 0 4px 16px rgba(0, 123, 255, 0.2);
        }

        .attachment-preview {
          position: relative;
          box-shadow: inset 0 0 15px rgba(0, 0, 0, .1), inset 0 0 0 1px rgba(0, 0, 0, .05);
          background: #f0f0f1;
          cursor: pointer;
        }

        .attachment-preview:before {
          content: "";
          display: block;
          padding-top: 100%;
        }

        .attachment .thumbnail {
          overflow: hidden;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          opacity: 1;
          transition: opacity .1s, transform 0.3s ease;
        }

        .attachment .thumbnail .centered {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: translate(50%, 50%);
        }

        .attachment .thumbnail .centered img {
          transform: translate(-50%, -50%);
          max-width: 100%;
          transition: transform 0.3s ease;
        }

        .attachment .portrait img {
          max-width: 100%;
        }

        .attachment:hover .thumbnail {
          transform: scale(1.02);
        }

        .attachment.selected {
          box-shadow: 0 0 0 2px #007bff;
        }

        .filename {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: white;
          padding: 8px;
          font-size: 12px;
          line-height: 1.3;
        }

        .check {
          display: none;
          height: 24px;
          width: 24px;
          padding: 0;
          border: 0;
          position: absolute;
          z-index: 10;
          top: 0;
          right: 0;
          outline: 0;
          background: #f0f0f1;
          cursor: pointer;
          box-shadow: 0 0 0 1px #fff, 0 0 0 2px rgba(0, 0, 0, .15);
          transition: all 0.2s ease;
        }

        .attachment.selected .check,
        .attachment:hover .check {
          display: block;
          background-color: #2271b1;
          box-shadow: 0 0 0 1px #fff, 0 0 0 2px #2271b1;
        }

        .check .media-modal-icon {
          display: block;
          height: 15px;
          width: 15px;
          margin: 5px;
          color: white;
          font-size: 12px;
          line-height: 15px;
          text-align: center;
        }

        .filename {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          max-height: 100%;
          word-wrap: break-word;
          text-align: center;
          font-weight: 600;
          background: rgba(255, 255, 255, .8);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15);
          padding: 4px;
          font-size: 11px;
          line-height: 1.2;
        }
      `}</style>
      
      <ul tabIndex="-1" className="attachments">
        {Object.values(thumbnails).map((thumbnail, index) => 
          renderThumbnail(thumbnail, index)
        )}
        {isLoadingMore && Array.from({length: 4}).map((_, index) => 
          renderSkeleton(index)
        )}
      </ul>
    </>
  );
});

export default Attachments;