import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const NotificationModal = forwardRef((props, ref) => {
  const [modalInstance, setModalInstance] = useState(null);

  useImperativeHandle(ref, () => ({
    show() {
      const modalElement = document.getElementById(props.params.id);
      if (modalElement && modalInstance) {
        modalInstance.show();
      }
    },
    hide() {
      const modalElement = document.getElementById(props.params.id);
      if (modalElement && modalInstance) {
        modalInstance.hide();
      }
    }
  }));

  const handleConfirm = () => {
    props.confirmEvent();
  };

  const closeNotification = () => {
    const modalElement = document.getElementById(props.params.id);
    if (modalElement && modalInstance) {
      modalInstance.hide();
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById(props.params.id);
    if (modalElement && !modalInstance) {
      const instance = new coreui.Modal(modalElement);
      setModalInstance(instance);
    }
  }, [props?.params?.id, modalInstance]);

  return (
    <div id={props?.params?.id} className="modal fade" tabIndex="-1">
      <div className={`${props.params.position || 'modal-dialog-centered'} modal-dialog`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{props?.params?.title}</h5>
            <button type="button" className="btn-close" onClick={closeNotification} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h6>{props?.params?.descriptions}</h6>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeNotification}>Close</button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default NotificationModal;
