import { forwardRef } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Attachments = forwardRef(({ thumbnails, checked, onClick }, ref) => {
  
  const renderThumbnail = (thumbnail) => {
    const { id, thumbnail_url, file_type, file_name, height, width } = thumbnail;
    const isPortrait = height > width;
    const isFileTypeMedia = file_type.startsWith('application') || file_type.startsWith('audio');
    
    return (
      <li 
        key={id}
        tabIndex={id}
        className={`attachment ${checked.includes(id) ? 'selected details' : ''}`}
        onClick={(ev) => {
          ev.preventDefault();
          onClick(thumbnail);
        }}>
        <div className="attachment-preview">
          <div className="thumbnail">
            <div className={isPortrait ? 'portrait' : 'centered'}>
              <LazyLoadImage src={thumbnail_url} effect="blur" />
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

  return (
    <ul tabIndex="-1" className="attachments">
      {Object.values(thumbnails).map(renderThumbnail)}
    </ul>
  );
});

export default Attachments;