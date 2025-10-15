import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const TableBody = forwardRef(({ options, rows, permissions, onAction, onCheckedAll, onRowClick, bulkAction = true }, ref) => {
  const { dataFields, primaryKey, dataSource, softDelete, displayInModal, edit_link, otherActions, hide_actions } = options;
  const tableRows = rows;
  const hasPermission = permissions;
  
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
    // If edit_link is enabled or hide_actions is true, don't render actions
    if (edit_link || hide_actions) {
      return null;
    }

    const actionLinks = [
      // Restore - requires can_delete permission and delDate must exist
      delDate && hasPermission?.can_delete && (
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction(id, 'Restore');
          }}
        >
          Restore
        </Link>
      ),
  
      // Edit - requires can_edit permission and row must NOT be deleted (optional, depending on your logic)
      !delDate && hasPermission?.can_edit && (
        displayInModal ? (
          <Link
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction(row, 'Edit');
            }}
          >
            Edit
          </Link>
        ) : (
          <Link
            to={`${dataSource}/${id}`}
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
        )
      ),
  
      // Download attachment (only if attachment exists and item is not deleted)
      attachment && !delDate && (
        <Link
          to={attachment}
          target="_blank"
          download
          onClick={(e) => e.stopPropagation()}
        >
          Download file
        </Link>
      ),
  
      // Other actions (only if not deleted)
      ...(
        Array.isArray(otherActions) && !delDate
          ? otherActions
              .filter(action => !action.show || action.show(row))
              .map((action, index) => {
                if (action.onClick) {
                  return (
                    <Link
                      key={index}
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                    >
                      {action.name}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={index}
                    to={`${action.link}/${id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {action.name}
                  </Link>
                );
              })
          : []
      ),
  
      // Trash - requires can_delete permission and item not deleted
      softDelete && !delDate && hasPermission?.can_delete && (
        <Link
          to="/"
          className="submitdelete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction(id, 'Trash');
          }}
        >
          Trash
        </Link>
      ),
  
      // Delete Permanently - requires can_delete permission and item deleted
      softDelete && delDate && hasPermission?.can_delete && (
        <Link
          to="/"
          className="submitdelete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction(id, 'Delete');
          }}
        >
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
            {bulkAction && (
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
            )}
            {Object.keys(dataFields).map((field, index) => {
              const columnMaxWidth = dataFields[field].maxWidth || '350px';
              const extraStyle = (index === 0) ? { whiteSpace: 'nowrap' } : {};
              
              // Render cell content
              const cellContent = (
                <>
                  {dataFields[field].attachment && row[field] && (
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
                    dataFields[field].render(row[field], row)
                  ) : (
                    row[field]
                  )}
                  {index === 0 && !edit_link && renderActions(rowId, row, delDate, row[dataFields[field].downloadUrl])}
                </>
              );

              // If edit_link is enabled and this is the first column (index 0), make it clickable
              if (edit_link && index === 0 && hasPermission?.can_edit && !delDate) {
                return (
                  <td 
                    key={field} 
                    style={{ maxWidth: columnMaxWidth, ...extraStyle, cursor: 'pointer' }} 
                    className={`${dataFields[field].className || ''} edit-link-cell`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (displayInModal) {
                        onAction(row, 'Edit');
                      } else {
                        window.location.href = `${dataSource}/${rowId}`;
                      }
                    }}
                  >
                    {cellContent}
                  </td>
                );
              }

              return (
                <td key={field} style={{ maxWidth: columnMaxWidth, ...extraStyle }} className={dataFields[field].className || undefined}>
                  {cellContent}
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
