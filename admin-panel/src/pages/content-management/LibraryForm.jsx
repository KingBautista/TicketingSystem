import Dropzone from "../../components/Dropzone";

export default function LibraryForm() { 
  const options = {
    accept: {
      'image': {type: ['png', 'jpg'], maxSize: 1024 * 2000},
      'video': {type: [], maxSize: 1024 * 5000},
      'audio': {type: [], maxSize: 1024 * 5000},
      'application': {type: [], maxSize: 1024 * 2000},
      'text': {type: [], maxSize: 1024 * 2000}
    },
    postUrl: '/content-management/media-library',
    redirectUrl: '/content-management/media-library'
  };

  return (
    <>
      <div className="card mb-2">
        <div className="card-header"><h4>Upload New Media</h4></div>
        <div className="card-body">
          <Dropzone options={options}/>
        </div>
      </div>
    </>
  )
}