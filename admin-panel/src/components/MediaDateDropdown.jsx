import { forwardRef, useEffect, useState } from "react";
import axiosClient from "../axios-client";

const MediaDateDropdown = forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownList, setDropdownList] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const getDateDirectories = () => {
    setIsLoading(true);
    axiosClient.get('/options/dates')
    .then(({data}) => {
      setDropdownList(data);
      setIsLoading(false);
    })
    .catch((errors) => {
			const response = errors.response;
      setErrorMsg(response.data.message);
      setIsLoading(false);
		});
  };

  useEffect(() => {
    getDateDirectories();
  }, []);

  const renderOptions = () => {
    const options = Array.from(dropdownList).map(date => {
      return (
        <option key={date.value} value={date.value}>
          {date.label}
        </option>
      );
    });

    return options;
  };

  const options = renderOptions();

  return (
    <select className="form-select" ref={ref}
    value={selectedOption} 
    onChange={ev => {ev.preventDefault(); setSelectedOption(ev.target.value); props.onChange(ev)}}>
      {isLoading && <option value="">Loading ...</option>}
      {!isLoading && <option value="">All dates</option>}
      {!isLoading && options}
    </select>
  );
});

export default MediaDateDropdown;