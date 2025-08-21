import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import NotificationModal from "../../components/NotificationModal";
import axiosClient from "../../axios-client";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import Pagination from "./Pagination";
import ToastMessage from "../ToastMessage";

// Unique ID generator
const generateUniqueId = () => `notifModal_${Math.random().toString(36).substr(2, 9)}`;

/**
 * DataTable Component
 * @param {Object} props
 * @param {Object} props.options - Table configuration options
 * @param {Object} props.options.dataFields - Column definitions
 * @param {string} props.options.dataSource - API endpoint for data
 * @param {boolean} props.options.softDelete - Enable soft delete functionality
 * @param {boolean} props.options.displayInModal - Show edit form in modal
 * @param {boolean} props.options.edit_link - Enable edit link on first column (hides renderActions)
 * @param {boolean} props.options.bulk_action - Enable bulk actions and checkboxes (default: true)
 * @param {Array} props.options.otherActions - Additional action buttons
 * @param {Object} props.options.otherActions[].name - Action button label
 * @param {string} [props.options.otherActions[].link] - URL for navigation action
 * @param {Function} [props.options.otherActions[].onClick] - Click handler for custom action
 * @param {Object} props.params - Additional query parameters
 * @param {Function} props.onOpenModal - Callback for opening edit modal
 * @param {Function} props.onRowClick - Callback for row click
 * @param {Function} props.setSubSub - Callback for updating counts
 * @param {Function} props.access - Access permissions
 */
const DataTable = forwardRef((props, ref) => {
  const tHeader = props.options.dataFields;
  const [sortParams, setSortParams] = useState({ order: '', sort: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [columnSize, setColumnSize] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [totalRows, setTotalRows] = useState(null);
  const [metaData, setMetaData] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toRestore, setToRestore] = useState(null);
  const [filters, setFilters] = useState({});
  const [modalDescription, setModalDescription] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const theadRef = useRef();
  const tbodyRef = useRef();
  const actionRef = useRef();
  const toastMessage = useRef();

  // Generate modal ID once per instance
  const [modalId] = useState(generateUniqueId());

  const notifParams = {
    id: modalId,
    title: "Confirmation",
    descriptions: modalDescription,
  };

  // Enhanced sorting logic with multi-column support
  const sorting = (col, sort) => {
    setSortParams(prev => ({
      ...prev,
      order: col,
      sort: prev.order === col && prev.sort === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Enhanced filter handling
  const handleFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enhanced action handling with bulk operations
  const handleAction = (id, action) => {
    setToRestore(null);
    setToDelete(null);

    const actionMessages = {
      Restore: "Do you really want to restore this record?",
      Trash: "Do you really want to delete this record?",
      Delete: "You are about to permanently delete these items from your site. This action cannot be undone.",
      BulkDelete: "You are about to permanently delete multiple items from your site. This action cannot be undone.",
      BulkRestore: "Do you really want to restore multiple records?",
    };

    // If the action is 'Edit' and displayModal is true, open the modal and exit
    if (action === 'Edit' && props?.options?.displayInModal) {
      props.onOpenModal?.(id);
      return;
    }

    if (actionMessages[action]) {
      setToRestore(action === 'Restore' || action === 'BulkRestore' ? id : null);
      setToDelete(action === 'Trash' || action === 'Delete' || action === 'BulkDelete' ? id : null);
      setModalDescription(actionMessages[action]);
      actionRef.current.show();
    }
  };

  // Validate action (restore or delete)
  const onValidate = () => {
    let url = '';

    if (toDelete) {
      url = `${props.options.dataSource}/${toDelete}`;
      axiosClient.delete(url)
      .then(handleResponse('danger'))
      .catch((errors) => {
        toastMessage.current.showError(errors.response);
      });
    }

    if (toRestore) {
      url = `${props.options.dataSource}/restore/${toRestore}`;
      axiosClient.patch(url)
      .then(handleResponse('success'))
      .catch((errors) => {
        toastMessage.current.showError(errors.response);
      });
    }

    actionRef.current.hide();
  };

  const handleResponse = (toastType) => (response) => {
    toastMessage.current.showToast(response.data.message, toastType);
    setNextPage(null);
    setCurrentPage(1);
    getDataSource();
  };

  // Enhanced data fetching with filters
  const getDataSource = () => {
    setIsLoading(true);
    let dataSource = props.options.dataSource;
    const params = {
      ...props.params,
      ...sortParams,
      ...filters,
      per_page: perPage,
      page: currentPage
    };

    axiosClient.get(dataSource, { params })
    .then(({ data }) => {
      if (data.data) {
        setTotalRows(data.meta.total.toLocaleString());
        if (props.options.softDelete) {
          props.setSubSub?.(data.meta.all, data.meta.trashed);
        }
        setDataRows(data.data);
        setMetaData(data.meta);
      } else {
        setTotalRows(data.length.toLocaleString());
        setDataRows(data);
        setMetaData({});
      }
      theadRef.current.setCheckedAll(false);
      setIsLoading(false);
    })
    .catch((errors) => {
      toastMessage.current.showError(errors.response);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    setColumnSize(Object.keys(tHeader).length);
    getDataSource();
  }, [props.params, props.options.dataSource, sortParams, currentPage, filters, perPage]);

  useEffect(() => {
    setNextPage(null);
    setCurrentPage(1);
  }, [props.params, filters]);

  useImperativeHandle(ref, () => ({
    getSelectedRows() {
      return tbodyRef.current.getSelectedData();
    },
    clearPage() {
      setNextPage(null);
      setCurrentPage(1);
    },
    reload() {
      setDataRows([]);
      getDataSource();
      theadRef.current.setCheckedAll(false);
    },
    applyFilter(field, value) {
      handleFilter(field, value);
    }
  }));

  const renderTableContent = () => {
    const bulkActionEnabled = props.options.bulk_action !== false;
    const colspan = bulkActionEnabled ? columnSize + 1 : columnSize;

    if (isLoading) {
      return (
        <tbody>
          <tr>
            <td colSpan={colspan} className="text-center">
              <span className="spinner-border spinner-border-sm ml-1"></span>&nbsp;Loading ...
            </td>
          </tr>
        </tbody>
      );
    }

    if (totalRows === '0') {
      return (
        <tbody>
          <tr>
            <td colSpan={colspan} className="text-center">
              {props.options.noRecordText || "No Record Found"}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <TableBody
        options={props.options}
        rows={dataRows}
        ref={tbodyRef}
        permissions={props.access}
        onAction={handleAction}
        onCheckedAll={(checked) => theadRef.current.setCheckedAll(checked)}
        onRowClick={props.onRowClick}
        bulkAction={props.options.bulk_action !== false}
      />
    );
  };

  const renderPagination = () => {
    console.log('Pagination Debug:', {
      isLoading,
      totalRows,
      dataRows: dataRows?.length,
      metaData
    });

    // Check if we have pagination data
    const total = typeof metaData?.total === 'string' ? parseInt(metaData.total) : metaData?.total;
    if (!isLoading && total > 0) {
      return <Pagination 
        metas={metaData} 
        onClick={(page) => setCurrentPage(page)} 
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage);
          setCurrentPage(1); // Reset to first page when changing per_page
        }}
      />;
    }
    return null;
  };

  const [tableHeight, setTableHeight] = useState('calc(100vh - 250px)');

  // Calculate dynamic height based on parent container
  useEffect(() => {
    const calculateHeight = () => {
      const tableElement = document.querySelector('.table-responsive');
      if (tableElement) {
        const rect = tableElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const topOffset = rect.top;
        const bottomOffset = 110; // Space for pagination and margins
        const availableHeight = viewportHeight - topOffset - bottomOffset;
        setTableHeight(`${Math.max(300, availableHeight)}px`);
      }
    };

    // Calculate on mount and resize
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    // Recalculate after a short delay to ensure parent containers are rendered
    const timeoutId = setTimeout(calculateHeight, 100);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div className="table-responsive" style={{ height: tableHeight }}>
        <table className="table-modern">
          <TableHeader 
            header={tHeader} 
            onCheckAll={(checked) => tbodyRef.current.checkedAll(checked)} 
            onSort={sorting} 
            onFilter={handleFilter}
            bulkAction={props.options.bulk_action !== false}
            ref={theadRef} 
          />
          {renderTableContent()}
        </table>
      </div>
      {renderPagination()}
      <NotificationModal params={notifParams} ref={actionRef} confirmEvent={onValidate} />
      <ToastMessage ref={toastMessage} />
    </>
  );
});

export default DataTable;