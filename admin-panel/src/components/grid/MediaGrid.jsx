import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import axiosClient from "../../axios-client";
import Attachments from "./Attachments";
import AttachmentInfo from "./AttachmentInfo";

const MediaGrid = forwardRef((props, ref) => {
  const [actionMode, setActionMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
      detailRef.current.set(media);
      detailRef.current.show();
    } else {
      setSelectedData([...selectedData, parseInt(media.id)]);
      if(selectedData.find(id => id == media.id) !== undefined)
        setSelectedData(selectedData.filter(id => id != media.id));
    }
  };

  const showError = (response) => {
    console.log(response);
    if(response && response.status === 422) {
      if(response.data.errors === undefined) {
        setErrorMsg(response.data.message);
      }
      setIsLoading(false);
    }
  };

  const getDataSource = () => {
    setIsLoading(true);
    let dataSource = props.options.dataSource;
    if(nextPage)
      dataSource = nextPage;

    axiosClient.get(dataSource, {
      params: props.params
    })
    .then(({data}) => {
      setTotalRows(data.meta.total.toLocaleString());
      setLoadMore(data.links.next);
      Array.from(data.data).map(data => {
        // let ifExist = dataRows.find((row) => row.id === data.id);
        // if (ifExist)
        //   return false;
        setDataRows(dataRows => [...dataRows, data]);
      });
      setIsLoading(false);
    })
    .catch((errors) => {
      showError(errors.response);
      setIsLoading(false);
		});
  };

  const refreshGrid = (action) => {
    setDataRows([]);
    setActionMode(true);
    setNextPage(null);
    getDataSource();
    if(action === 'delete')
      detailRef.current.hide();
  };

  useEffect(() => {
    getDataSource();
  }, [props.params, nextPage]); 

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
      },

      reload() {
        setActionMode(true);
        setNextPage(null);
        setDataRows([]);
        getDataSource();
      }
    };
  });

  return (
    <>
    <div className={'attachments-wrapper '+ ((actionMode === false) ? 'select-mode' : 'edit-mode')}>
      {errorMsg && <div className="text-center alert alert-danger">{errorMsg}</div>}
      {!errorMsg && !isLoading && dataRows.length === 0 && <div className="text-center"> No Record Found. </div>}
      {!isLoading && dataRows.length > 0 && dataRows && <Attachments thumbnails={dataRows} checked={selectedData} onClick={handleSelected}/>}
      {!errorMsg && <div className="load-more-wrapper">
        {isLoading && <span className="spinner"><span className="spinner-border spinner-border-sm ml-1" role="status"></span> Loading ...</span>}
        {!isLoading && <p className="load-more-count">Showing {dataRows.length} of {totalRows} media items</p>}
        {dataRows.length < totalRows && <button type="button" className="btn btn-secondary btn-sm" onClick={ en => setNextPage(loadMore)}>Load more</button>}
        {dataRows.length === totalRows && <button type="button" className="btn btn-secondary btn-sm">Jump to first loaded item</button>}
      </div>}
    </div>
    <AttachmentInfo options={props.options} ref={detailRef} onChange={refreshGrid} />
    </>
  );
});

export default MediaGrid;