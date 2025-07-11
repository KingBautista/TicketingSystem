import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from "react";
import '/public/assets/scss/tree-dropdown.css';

const TreeDropdown = forwardRef((props, ref) => {
  // State Setup
  const [searchBox, setSearchBox] = useState('');
  const [inputWidth, setInputWidth] = useState(15);
  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [parentNodes, setParentNodes] = useState(props.options);
  const [childNodes, setChildNodes] = useState([]);
  const [expandedOptions, setExpandedOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loadingState, setLoadingState] = useState({});  // Track loading state for each option
  
  // Refs
  const inputSearch = useRef();
  const myDropdown = useRef();

  // Flags
  const multiple = props.multiple === 'true';
  const searchable = props.searchable !== 'false';
  const placeholder = props.placeholder;

  // Event Handlers
  const handleDropdownToggle = () => {
    setClicked(true);
    setIsOpen(!isOpen);
    inputSearch.current.focus();
  };

  const handleDropdownClose = (ev) => {
    if (!myDropdown.current.contains(ev.target)) {
      resetDropdownState();
    }
  };

  const resetDropdownState = () => {
    setIsOpen(false);
    setIsHidden(false);
    setInputWidth(15);
    setClicked(false);
    inputSearch.current.value = '';
  };

  const handleOptionToggle = (option) => {
    // Track the loading state for the specific option being expanded
    setLoadingState((prev) => ({ ...prev, [option.id]: true }));
    
    setExpandedOptions((prev) =>
      prev.includes(option.id)
        ? prev.filter((id) => id !== option.id)
        : [...prev, option.id]
    );

    if (!childNodes[option.id] && !option.children) {
      props.loadOptions(option.id, (options) => {
        setChildNodes((prev) => ({ ...prev, [option.id]: options }));
        setLoadingState((prev) => ({ ...prev, [option.id]: false }));  // Stop loading for this option
      });
    } else {
      setLoadingState((prev) => ({ ...prev, [option.id]: false }));  // Stop loading if children are already present
    }
  };

  const handleOptionSelect = (option) => {
    if (multiple) {
      setSelectedOptions((prev) => 
      {
        const updated = prev.some((item) => item.id === option.id)
          ? prev.filter((item) => item.id !== option.id)
          : [...prev, option];
        return updated;
      });
    } 
    else {
      setSelectedOptions(option);
    }
  
    setIsHidden(false);
    if (!multiple) setIsOpen(false);
  };

  const searchNodes = (query) => {
    const regex = convertToRegex(query);
    let results = [];

    if (!query) return [];

    const hasChildren = parentNodes.some((item) => item.children?.length > 0);
    
    if (hasChildren) {
      results = parentNodes.filter((parent) => {
        const childrenMatch = parent.children?.some((child) => regex.test(child.label));
        if (childrenMatch) {
          parent.filteredChildren = parent.children.filter((child) => regex.test(child.label));
          return true;
        }
        return regex.test(parent.label);
      });
    } else {
      results = searchFlatNodes(regex);
    }

    return results;
  };

  const searchFlatNodes = (regex) => {
    const matchingParents = parentNodes.filter((parent) => regex.test(parent.label));
    const childrenResults = [];

    Object.keys(childNodes).forEach((parentId) => {
      const children = childNodes[parentId];
      const matchingChildren = children.filter((child) => regex.test(child.label));

      if (matchingChildren.length) {
        const parent = parentNodes.find((parent) => parent.id === parseInt(parentId));
        childrenResults.push({
          id: parent.id,
          label: parent.label,
          slug: parent.slug,
          filteredChildren: matchingChildren,
        });
      }
    });

    const parentResults = matchingParents.map((parent) => {
      const parentChildren = childNodes[parent.id]?.filter((child) => regex.test(child.label)) || [];
      return {
        id: parent.id,
        label: parent.label,
        slug: parent.slug,
        filteredChildren: parentChildren,
      };
    });

    return childrenResults.length ? childrenResults : parentResults;
  };

  const convertToRegex = (query) => {
    return new RegExp(query.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
  };

  const handleSearch = () => {
    const query = inputSearch.current.value;
    if (query !== searchBox) 
    {
      setSearchBox(query);
      setSearchResult(searchNodes(query));
    }
  };

  const removeOption = (id) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== id));
  
    if (props.onChange) {
      props.onChange();
    }
  };

  const getSelected = () => {
    if (multiple) 
    {
      return selectedOptions.length ? (
        selectedOptions.map((option) => (
          <div className="tree-dropdown-multi-value-item-container" key={option.id}>
            <div className="tree-dropdown-multi-value-item">
              <span className="tree-dropdown-multi-value-label">
                {option.label || option.name}
              </span>
              <span
                className="tree-dropdown-value-remove"
                onClick={() => removeOption(option.id)}
              >
                <svg>
                  <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-x" />
                </svg>
              </span>
            </div>
          </div>
        ))
      ) : null;
    } else {
      return selectedOptions && (
        <div className="tree-dropdown-single-value">
          {selectedOptions.label || selectedOptions.name}
        </div>
      );
    }
  };

  const selectedClass = (option) => {
    return [
      'tree-dropdown-option',
      (multiple && Array.isArray(selectedOptions) && selectedOptions.some((item) => item.id === option.id)) || 
      (!multiple && selectedOptions && selectedOptions.id === option.id)
        ? 'tree-dropdown-option-selected'
        : '',
    ]
    .join(' ')
    .trim();
  };

  const arrowClass = (option) => {
    return [
      'tree-dropdown-option-arrow',
      expandedOptions.includes(option.id) ? 'tree-dropdown-option-arrow-rotated' : '',
    ]
    .join(' ')
    .trim();
  };

  const loading = (classname) => {
    return (
      <div className={classname}>
        <span className="spinner-grow spinner-grow-sm dropdown-loader"></span>&nbsp;Loading...
      </div>
    );
  };

  const renderOptions = (option, level) => {
    const children = option.filteredChildren || childNodes[option.id] || option.children || [];
    const expanded = expandedOptions.includes(option.id);
    const listItemClass = `tree-dropdown-list-item tree-dropdown-indent-level-${level}`;

    return (
      <div className={listItemClass} key={option.id}>
        <div className={selectedClass(option)}>
          {children.length === 0 && !props.loadOptions ? (
            <div className="tree-dropdown-option-arrow-placeholder" style={{width:'5px'}}></div>
          ) : (
            <div className="tree-dropdown-option-arrow-container" onClick={() => handleOptionToggle(option)}>
              <svg className={arrowClass(option)}>
                <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-caret-bottom" />
              </svg>
            </div>
          )}
          <div className="tree-dropdown-label-container" onClick={() => handleOptionSelect(option)}>
            <label className="tree-dropdown-label">{(option.label) ? option.label : option.name }</label>
          </div>
        </div>
        {expanded && children.length === 0 && loadingState[option.id] && loading(listItemClass)}
        {expanded && children.length > 0 && renderTreeDropdown(children, level + 1)}
      </div>
    );
  };

  const renderTreeDropdown = (nodes = [], level = 0) => {
    let options = nodes.length ? nodes : searchResult.length ? searchResult : parentNodes;
    return (
      <div className="tree-dropdown-list">
        {options && options.map((option) => renderOptions(option, level))}
      </div>
    );
  };

  const getMainClass = () => {
    return [
      'tree-dropdown',
      multiple ? 'tree-dropdown-multi' : 'tree-dropdown-single',
      searchable ? 'tree-dropdown-searchable' : '',
      isOpen ? 'tree-dropdown-open tree-dropdown-open-below' : '',
    ]
    .join(' ')
    .trim();
  };

  // Pre-setup & effects
  useEffect(() => {
    if (props.options) {
      setParentNodes(props.options);
    } else if (props.loadOptions) {
      props.loadOptions(null, (options) => {
        setParentNodes(options);
      });
    }

    if (props.values) {
      if(multiple) {
        const parsedValues = JSON.parse(props.values);
        setSelectedOptions(Array.isArray(parsedValues) ? parsedValues : [parsedValues]);
      }
      else {
        setSelectedOptions(JSON.parse(props.values));
      }
    }

    document.addEventListener('mousedown', handleDropdownClose);
    return () => document.removeEventListener('mousedown', handleDropdownClose);
  }, [props.options, props.values]);

  useEffect(() => {
    if (props.onChange !== undefined) {
      props.onChange(selectedOptions);
    }
  }, [selectedOptions]);

  useImperativeHandle(ref, () => ({
    getValue() {
      return selectedOptions;
    }
  }));

  // JSX Render
  return (
    <div ref={myDropdown} className={getMainClass()}>
      <div className="tree-dropdown-control">
        <div className="tree-dropdown-value-container" onClick={!clicked ? handleDropdownToggle : null}>
          <div className={multiple ? 'tree-dropdown-multi-value' : ''}>
            <div
              className={`tree-dropdown-placeholder tree-dropdown-helper-zoom-effect-off ${
                isHidden || selectedOptions?.id > 0 || selectedOptions?.length ? 'tree-dropdown-helper-hide' : ''
              }`}>
              {placeholder}
            </div>
            {getSelected()}
            <div className="tree-dropdown-input-container">
              <input
                ref={inputSearch}
                type="text"
                autoComplete="off"
                tabIndex="0"
                className="tree-dropdown-input"
                style={multiple ? { width: `${inputWidth}px` } : {}}
                onChange={(ev) => {
                  setSearchBox(ev.target.value);
                  setInputWidth(inputWidth + 15);
                  handleSearch();
                }}
                onFocus={() => setIsHidden(true)}
              />
              {multiple && <div className="tree-dropdown-sizer">{searchBox}</div>}
            </div>
          </div>
        </div>
        <div className="tree-dropdown-control-arrow-container" onClick={handleDropdownToggle}>
          <svg className={`tree-dropdown-control-arrow ${isOpen ? 'tree-dropdown-control-arrow-rotated' : ''}`}>
            <use xlinkHref="/assets/vendors/@coreui/icons/svg/free.svg#cil-chevron-bottom" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="tree-dropdown-menu-container" style={{ zIndex: 999 }}>
          <div className="tree-dropdown-menu" style={{ maxHeight: '200px' }}>
            {renderTreeDropdown()}
          </div>
        </div>
      )}
    </div>
  );
});

export default TreeDropdown;