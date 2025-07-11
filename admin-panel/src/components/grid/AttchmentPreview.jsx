import React, { forwardRef } from 'react';
import ReactPlayer from 'react-player';

const AttachmentPreview = forwardRef((props, ref) => {
  const { details } = props;
  if (!details) return null;

  const { file_type, file_url } = details;
  const fileCategory = file_type.split('/')[0];

  const renderImagePreview = () => (
    <div className="thumbnail">
      <img className="details-image" src={file_url} alt="attachment preview" draggable="false" />
    </div>
  );

  const renderVideoOrAudioPreview = () => (
    <div className="player-wrapper">
      <ReactPlayer
        className="react-player"
        url={file_url}
        width="100%"
        height="100%"
        muted={true}
        playing={true}
        controls={true}
      />
    </div>
  );

  const renderFilePreview = () => (
    <div className="thumbnail">
      <img
        className="details-image"
        src="/assets/img/view-file-icon.jpg"
        alt="file preview"
        draggable="false"
      />
    </div>
  );

  if (fileCategory === 'image') {
    return renderImagePreview();
  }

  if (fileCategory === 'video' || fileCategory === 'audio') {
    return renderVideoOrAudioPreview();
  }

  if (fileCategory === 'application') {
    return renderFilePreview();
  }

  return null;
});

export default AttachmentPreview;
