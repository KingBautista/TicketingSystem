import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import axiosClient from "../../axios-client";
import Attachments from "./Attachments";
import AttachmentInfo from "./AttachmentInfo";

const MediaGrid = forwardRef((props, ref) => {
  const [actionMode, setActionMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [totalRows, setTotalRows] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [loadMore, setLoadMore] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedData, setSelectedData] = useState([]);
  const detailRef = useRef();

  const handleSelected = (media) => {
    if(props.onClick !== undefined) {
      setSelectedData([media.id]);
      props.onClick(media);
      return false;
    }

    if(actionMode === true) {
      detailRef.current?.set(media);
      detailRef.current?.show();
    } else {
      setSelectedData(prevSelected => {
        const isAlreadySelected = prevSelected.find(id => id == media.id) !== undefined;
        if(isAlreadySelected) {
          return prevSelected.filter(id => id != media.id);
        } else {
          return [...prevSelected, parseInt(media.id)];
        }
      });
    }
  };

  const showError = (response) => {
    console.log(response);
    if(response && response.status === 422) {
      if(response.data?.errors === undefined) {
        setErrorMsg(response.data?.message || 'An error occurred');
      }
    }
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  const getDataSource = (isLoadMoreAction = false) => {
    if (isLoadMoreAction) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    let dataSource = props.options.dataSource;
    if(nextPage && isLoadMoreAction) {
      dataSource = nextPage;
    }

    axiosClient.get(dataSource, {
      params: props.params
    })
    .then(({data}) => {
      setTotalRows(data.meta.total);
      setLoadMore(data.links.next);
      
      if (isLoadMoreAction) {
        // Smooth addition of new items with a slight delay for better UX
        setTimeout(() => {
          setDataRows(prevRows => {
            // Filter out any potential duplicates based on ID
            const existingIds = prevRows.map(row => row.id);
            const newItems = data.data.filter(item => !existingIds.includes(item.id));
            return [...prevRows, ...newItems];
          });
          setIsLoadingMore(false);
        }, 300); // Small delay to show skeleton loading
      } else {
        setDataRows(data.data);
        setIsLoading(false);
      }
    })
    .catch((errors) => {
      showError(errors.response);
    });
  };

  const handleLoadMoreClick = () => {
    if (loadMore && !isLoadingMore) {
      setNextPage(loadMore);
      getDataSource(true);
    }
  };

  const refreshGrid = (action) => {
    setDataRows([]);
    setActionMode(true);
    setNextPage(null);
    setSelectedData([]);
    getDataSource();
    if(action === 'delete' && detailRef.current) {
      detailRef.current.hide();
    }
  };

  useEffect(() => {
    getDataSource();
  }, [props.params]); 

  useEffect(() => {
    if (nextPage) {
      getDataSource(true);
    }
  }, [nextPage]);

  useImperativeHandle(ref, () => {
    return {      
      getSelectedRows() {
        return selectedData;
      },

      onEdit(mode) {
        setActionMode(mode);
        if(mode === true) {
          setSelectedData([]);
        }
      },

      clearGrid() {
        setDataRows([]);
        setNextPage(null);
        setSelectedData([]);
      },

      reload() {
        setActionMode(true);
        setNextPage(null);
        setDataRows([]);
        setSelectedData([]);
        getDataSource();
      }
    };
  });

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .attachments-wrapper {
          position: static;
          overflow: auto;
          outline: 0;
          transition: all 0.3s ease;
          width: 100%;
        }

        .attachments-wrapper.select-mode {
          background-color: rgba(0, 123, 255, 0.05);
          border-radius: 8px;
        }

        .load-more-wrapper {
          text-align: center;
          padding: 24px 0;
          animation: fadeIn 0.5s ease;
        }

        .load-more-count {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 16px;
          animation: fadeIn 0.5s ease 0.1s both;
        }

        .btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn:hover:not(:disabled) {
          background: #545b62;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #6c757d;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .spinner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .spinner-border {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-border-sm {
          width: 14px;
          height: 14px;
          border-width: 1.5px;
        }

        .alert {
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid transparent;
          border-radius: 4px;
          animation: fadeIn 0.5s ease;
        }

        .alert-danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }

        .text-center {
          text-align: center;
        }

        .ml-1 {
          margin-left: 0.25rem;
        }

        .no-records {
          padding: 40px 20px;
          color: #6c757d;
          font-size: 16px;
          text-align: center;
          animation: fadeIn 0.5s ease;
        }
      `}</style>
      
      <div className={'attachments-wrapper '+ ((actionMode === false) ? 'select-mode' : 'edit-mode')}>
        {errorMsg && (
          <div className="text-center alert alert-danger">{errorMsg}</div>
        )}
        
        {!errorMsg && !isLoading && dataRows.length === 0 && (
          <div className="text-center no-records"> No Record Found. </div>
        )}
        
        {!isLoading && dataRows.length > 0 && (
          <Attachments 
            thumbnails={dataRows} 
            checked={selectedData} 
            onClick={handleSelected}
            isLoadingMore={isLoadingMore}
          />
        )}
        
        {!errorMsg && (
          <div className="load-more-wrapper">
            {isLoading && (
              <span className="spinner">
                <span className="spinner-border spinner-border-sm ml-1" role="status"></span> 
                Loading ...
              </span>
            )}
            
            {!isLoading && (
              <p className="load-more-count">
                Showing {dataRows.length} of {totalRows?.toLocaleString()} media items
              </p>
            )}
            
            {dataRows.length < totalRows && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleLoadMoreClick}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Loading more...
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            )}
            
            {dataRows.length >= totalRows && dataRows.length > 0 && (
              <button type="button" className="btn btn-secondary">
                Jump to first loaded item
              </button>
            )}
          </div>
        )}
      </div>
      
      <AttachmentInfo options={props.options} ref={detailRef} onChange={refreshGrid} />
    </>
  );
});

export default MediaGrid;