import { forwardRef, useImperativeHandle, useState, useRef } from "react";

const ToastMessage = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState([]);
  const toastContainerRef = useRef(null);

  const toastMessage = (message, type = 'success', id = 1) => {
    // Create a new toast object
    const toast = { message, type, id: Date.now()+id };
  
    // Add the toast to the list of toasts
    setToasts((prevToasts) => [...prevToasts, toast]);

    // Create the toast element using CoreUI
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast', 'fade', 'show', `bg-${type}`, 'text-white');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.innerHTML = `
      <div class="toast-body d-flex p-3">
        <span>${message}</span>
        <button type="button" class="btn-close btn-close-white me-n2 m-auto" data-coreui-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Append the toast to the container
    if (toastContainerRef.current) {
      toastContainerRef.current.appendChild(toastElement);
    }

    // Initialize and show the toast using CoreUI
    const toastInstance = new coreui.Toast(toastElement, { autohide: true, delay: 3000 });
    toastInstance.show();

    // Remove the toast after it's dismissed
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  };

  // exposing methods to parent component
  useImperativeHandle(ref, () => {
    return {
      showToast(message, type = 'success', id = 1) {
        toastMessage(message, type, id);
      },
      showError(response) {
        if (response?.status === 422) {
          const errors = response?.data?.errors;
      
          if (!errors) {
            // Show general error message if there are no specific field errors
            toastMessage(response.data.message, 'danger');
          } else {
            // Show field-specific errors
            Object.keys(errors).forEach(key => {
              toastMessage(errors[key], 'danger', key);
            });
          }
        }
      }
    };
  });

  return (
    <div ref={toastContainerRef} className="toast-container position-fixed top-0 end-0 p-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast text-bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-body d-flex p-3">
            <span>{toast.message}</span>
            <button type="button" className="btn-close btn-close-white me-n2 m-auto" data-coreui-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      ))}
    </div>
  );
});

export default ToastMessage;