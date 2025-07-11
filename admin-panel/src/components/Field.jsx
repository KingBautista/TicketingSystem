// Field.js
import React from 'react';

const Field = ({ 
  label, 
  inputComponent, 
  tipMessage, 
  errorMessage,
  required = false,
  labelClass = 'col-sm-2', 
  inputClass = 'col-sm-4',
  validationState = null,
  helpText = null,
  inline = false
}) => {
  const getValidationClass = () => {
    if (validationState === null) return '';
    return validationState ? 'is-valid' : 'is-invalid';
  };

  const renderLabel = () => {
    if (!label) return null;
    return (
      <label className={`col-form-label ${labelClass}`}>
        {label}
        {required && <span className="text-danger"> * </span>}
      </label>
    );
  };

  const renderHelpText = () => {
    if (!helpText) return null;
    return <small className="form-text text-muted">{helpText}</small>;
  };

  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    return <div className="invalid-feedback">{errorMessage}</div>;
  };

  const renderTipMessage = () => {
    if (!tipMessage) return null;
    return <p className="tip-message" style={{ margin: 0 }}>{tipMessage}</p>;
  };

  const containerClass = inline ? 'd-flex align-items-center' : 'mb-3 row';

  return (
    <div className={containerClass}>
      {renderLabel()}
      <div className={`has-validation ${inputClass}`}>
        {React.cloneElement(inputComponent, {
          className: `${inputComponent.props.className || ''} ${getValidationClass()}`.trim()
        })}
        {renderHelpText()}
        {renderErrorMessage()}
        {renderTipMessage()}
      </div>
    </div>
  );
};

export default Field;
