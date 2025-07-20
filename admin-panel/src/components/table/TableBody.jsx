import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const TableBody = forwardRef(({ options, rows, onAction, onCheckedAll, onRowClick }, ref) => {
  const { dataFields, primaryKey, dataSource, softDelete, displayInModal, otherActions } = options;
  const tableRows = rows;
  
  const [selectedData, setSelectedData] = useState([]);
  const [isCheckedAll, setIsCheckedAll] = useState(false);

  const handleCheckboxChange = (ev) => {
    const { value, checked } = ev.target;
    const updatedSelectedData = checked
      ? [...selectedData, parseInt(value)]
      : selectedData.filter(id => id !== parseInt(value));

    setSelectedData(updatedSelectedData);

    if (updatedSelectedData.length === Object.keys(tableRows).length) {
      setIsCheckedAll(true);
      onCheckedAll(true);
    } else {
      setIsCheckedAll(false);
      onCheckedAll(false);
    }
  };

  const handleCheckAll = (isCheckedAll) => {
    const allSelected = isCheckedAll ? Object.keys(tableRows).map(key => tableRows[key].id) : [];
    setSelectedData(allSelected);
    setIsCheckedAll(!isCheckedAll);
  };

  useImperativeHandle(ref, () => ({
    checkedAll: handleCheckAll,
    getSelectedData: () => selectedData
  }));

  const renderActions = (id, row, delDate, attachment) => {
    const actionLinks = [
      delDate ? (
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction(id, 'Restore');
          }}>
          Restore
        </Link>
      ) : (
        displayInModal ? (
          <Link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction(row, 'Edit');
            }}>
            Edit
          </Link>
        ) : (
          <Link
            to={`${dataSource}/${id}`}
            onClick={(e) => e.stopPropagation()}>
            Edit
          </Link>
        )
      ),
      attachment && !delDate && (
        <Link
          to={attachment}
          target="_blank"
          download
          onClick={(e) => e.stopPropagation()}>
          Download file
        </Link>
      ),
      ...(
        Array.isArray(otherActions)
          ? otherActions
              .filter(action => !action.show || action.show(row))
              .map((action, index) => {
                if (!delDate) {
                  if (action.onClick) {
                    return (
                      <Link
                        key={index}
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          action.onClick(row);
                        }}>
                        {action.name}
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      to={`${action.link}/${id}`}
                      onClick={(e) => e.stopPropagation()}>
                      {action.name}
                    </Link>
                  );
                }
                return null;
              })
          : []
      ),
      softDelete && !delDate && (
        <Link
          to="/"
          className="submitdelete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction(id, 'Trash');
          }}>
          Trash
        </Link>
      ),
      softDelete && delDate && (
        <Link
          to="/"
          className="submitdelete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction(id, 'Delete');
          }}>
          Delete Permanently
        </Link>
      )
    ].filter(Boolean);
  
    return (
      <div className="row-actions">
        {actionLinks.map((action, index) => (
          <span key={index}>
            {action}
            {index < actionLinks.length - 1 && ' '}
          </span>
        ))}
      </div>
    );
  };  

  return (
    <tbody>
      {Object.keys(tableRows).map((key) => {
        const row = tableRows[key];
        const rowId = row[primaryKey];
        const delDate = row['deleted_at'];

        return (
          <tr
            key={key}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            onClick={() => onRowClick?.(row)}>
            <td>
              <input
                className="form-check-input"
                type="checkbox"
                value={rowId}
                onChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                checked={selectedData.includes(rowId)}
              />
            </td>
            {Object.keys(dataFields).map((field, index) => {
              const columnMaxWidth = dataFields[field].maxWidth || 'none';

              return (
                <td key={field} style={{ 
                  maxWidth: columnMaxWidth,
                  whiteSpace: index === 0 ? 'nowrap' : 'normal'
                }}>
                  {field === 'name' && dataFields[field].attachment && row[dataFields[field].attachment] && (
                    <span className="media-icon me-2">
                      <LazyLoadImage
                        src={row[dataFields[field].attachment]}
                        alt={row[dataFields[field].attachment]}
                        width={40}
                        height={40}
                        effect="blur"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/img/no-image.png';
                        }}
                      />
                    </span>
                  )}
                  {field !== 'name' && dataFields[field].attachment && row[field] && (
                    <span className="media-icon">
                      <LazyLoadImage
                        src={row[field]}
                        alt={row[field]}
                        width={60}
                        height={60}
                        effect="blur"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/img/no-image.png';
                        }}
                      />
                    </span>
                  )}
                  {dataFields[field].badge ? (
                    <span className={`badge ${dataFields[field].badge[row[field]] || 'bg-secondary'}`}>
                      {dataFields[field].badgeLabels ? dataFields[field].badgeLabels[row[field]] || row[field] : row[field]}
                    </span>
                  ) : dataFields[field].render ? (
                    dataFields[field].render(row)
                  ) : (
                    row[field]
                  )}
                  {index === 0 && renderActions(rowId, row, delDate, row[dataFields[field].downloadUrl])}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
});

export default TableBody;
