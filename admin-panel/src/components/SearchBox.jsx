import { forwardRef } from "react";

const SearchBox = forwardRef((props, ref) => {
  const handleKeyDown = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault(); // Prevents form submission
      props.onClick(); // Triggers the onClick function
    }
  };

  const handleButtonClick = (ev) => {
    ev.preventDefault(); // Prevents form submission or default button behavior
    props.onClick(); // Triggers the onClick function
  };

  return (
    <div className="input-group">
      <input
        ref={ref}
        className="form-control form-control-sm"
        type="text"
        placeholder="Search"
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={handleButtonClick}
      >
        Search &nbsp;
        <svg className="sidebar-brand-narrow" width="18" height="18">
          <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-search"></use>
        </svg>
      </button>
    </div>
  );
});

export default SearchBox;
