import { forwardRef, useState, useCallback, useImperativeHandle } from "react";

const TableHeader = forwardRef(({ header, onCheckAll, onSort }, ref) => {
  const [isCheckedAll, setIsCheckedAll] = useState(false);

  // Toggle the "select all" checkbox state
  const checkedAll = (e) => {
    const newCheckedState = !isCheckedAll;
    setIsCheckedAll(newCheckedState);
    onCheckAll(newCheckedState); // Notify parent about the change
  };

  useImperativeHandle(ref, () => ({
    setCheckedAll: setIsCheckedAll
  }));

  // Handle sorting for columns
  const orderBy = (ev) => {
    ev.preventDefault();
    const currentColumn = ev.target.closest('th');
    const currentIcon = currentColumn.querySelector('use');
    const currentField = currentColumn.getAttribute('data-field');
    const currentOrderBy = currentColumn.getAttribute('data-orderby');

    if (currentField) {  // Make sure currentField is not null
      const newOrder = currentOrderBy === 'asc' ? 'desc' : 'asc';
      currentColumn.setAttribute('data-orderby', newOrder);
      currentIcon.setAttribute('xlink:href', `/assets/vendors/@coreui/icons/svg/free.svg#cil-sort-${newOrder === 'asc' ? 'ascending' : 'descending'}`);

      // Trigger sorting with the correct parameters
      onSort(currentField, newOrder);
    } else {
      console.error('currentField is null');
    }
  };

  return (
    <thead className="align-middle">
      <tr>
        <th scope="col">
          <input
            className="form-check-input"
            type="checkbox"
            onChange={checkedAll}
            checked={isCheckedAll}
          />
        </th>
        {header && Object.keys(header).map((key, i) => (
          <th
            key={key}
            scope="col"
            data-field={key}  // Set data-field on the <th>
            data-orderby="asc"
            style={{ whiteSpace: 'nowrap' }}>
            {header[key].name}&nbsp;
            {header[key].withSort && (
              <svg
                className="sidebar-brand-narrow"
                width="18"
                height="18"
                onClick={orderBy}>
                <use id={`icon${i}`} xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-sort-ascending" />
              </svg>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
});

export default TableHeader;