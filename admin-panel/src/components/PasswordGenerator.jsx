import React, { useState } from 'react';
import DOMPurify from 'dompurify';

const PasswordGenerator = ({ label, setUser, user, labelClass = 'col-sm-2', inputClass = 'col-sm-4'}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Generate a random password
  const genPassword = (len) => {
    let length = len || 10;
    let string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numeric = '0123456789';
    let punctuation = '@$!%*#?&';
    let password = "";
    
    while (password.length < length) {
      let char1 = string.charAt(Math.floor(Math.random() * string.length));
      let char2 = numeric.charAt(Math.floor(Math.random() * numeric.length));
      let char3 = punctuation.charAt(Math.floor(Math.random() * punctuation.length));
      
      password += char1 + char2 + char3;
    }

    // Shuffle and return the generated password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    setNewPassword(password.substr(0, len)); // Set generated password
    setUser({ ...user, user_pass: DOMPurify.sanitize(password.substr(0, len)) }); // Update parent state
  };

  // Show generated password
  const handleShowPassword = () => {
    setShowPassword(true);
    genPassword(15); // Generate a password with 15 characters
  };

  // Hide the generated password
  const handleHidePassword = () => {
    setShowPassword(false);
  };

  // Regenerate password
  const handleRegenPassword = () => {
    genPassword(15);
  };

  return (
    <div className="mb-3 row">
      <label className={`col-form-label ${labelClass}`}>{label}</label>
      <div className={`has-validation ${inputClass}`}>
        {!showPassword ? (
          <button className="btn btn-secondary btn-sm" type="button" onClick={handleShowPassword}>
            Generate Password
          </button>
        ) : (
          <div className="input-group mb-3">
            <input
              className="form-control"
              type="text"
              value={newPassword}
              onChange={ev => {
                const val = DOMPurify.sanitize(ev.target.value);
                setNewPassword(val);
                setUser({ ...user, user_pass: val });
              }}
              autoComplete="new-password"
            />
            <button className="btn btn-primary btn-sm" type="button" onClick={handleRegenPassword}>
              <svg className="icon">
                <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-loop-circular"></use>
              </svg>
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={handleHidePassword}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
