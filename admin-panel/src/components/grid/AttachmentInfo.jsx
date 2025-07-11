import { forwardRef, useImperativeHandle, useState } from "react";
import AttchmentPreview from "./AttchmentPreview";
import AttachmentForm from "./AttachmentForm";

const AttachmentInfo = forwardRef(({ options, onChange }, ref) => {
  const [details, setDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // To control modal visibility directly
  const closeModal = () => setIsModalVisible(false);
  const openModal = () => setIsModalVisible(true);

  useImperativeHandle(ref, () => ({
    set(attachment) {
      setDetails(attachment);
    },
    show() {
      openModal();
    },
    hide() {
      closeModal();
    },
  }));

  return (
    <>
      {/* Conditionally render modal */}
      {isModalVisible && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Attachment Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-7 col-12 attachment-media-view">
                    <AttchmentPreview details={details} />
                  </div>
                  <div className="col-md-5 col-12">
                    <AttachmentForm
                      details={details}
                      options={options}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default AttachmentInfo;
