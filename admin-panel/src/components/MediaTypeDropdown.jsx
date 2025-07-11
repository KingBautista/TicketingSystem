import { forwardRef, useState } from "react";

const MediaTypeDropdown = forwardRef((props, ref) => {
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <select className="form-select form-select-sm" ref={ref}
    value={selectedOption} 
    onChange={ev => {ev.preventDefault(); setSelectedOption(ev.target.value); props.onChange(ev)}}>
      <option value="">All Media Items</option>
      <option value="image">Images</option>
      <option value="audio">Audio</option>
      <option value="video">Video</option>
      <option value="application">Documents</option>
    </select>
  );
});

export default MediaTypeDropdown;