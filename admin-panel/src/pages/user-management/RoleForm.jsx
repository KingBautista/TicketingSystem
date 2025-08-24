import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import ToastMessage from "../../components/ToastMessage";
import Field from "../../components/Field";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solidIconMap } from '../../utils/solidIcons';

export default function RoleForm() {
  const {id} = useParams();
  const navigate = useNavigate();
  const toastAction = useRef();
  const parentCheckboxRefs = useRef([]);

  const [buttonText, setButtonText] = useState('Create Role');  
  const [isLoading, setIsLoading] = useState();
  const [isActive, setIsActive] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // New state for Super Admin checkbox
  const [navigations, setNavigations] = useState([]);

  const [role, setRole] = useState({  
    id: null,
    name: '',
    permissions: {}
  });

  // Handle the child checkbox change
  const handlePermissionChange = (navigationId, permissionId, permissionType, isChecked) => {
    const updatedPermissions = { ...role.permissions };
  
    if (!updatedPermissions[navigationId]) {
      updatedPermissions[navigationId] = {};
    }
  
    if (!updatedPermissions[navigationId][permissionId]) {
      updatedPermissions[navigationId][permissionId] = {};
    }
  
    updatedPermissions[navigationId][permissionId][permissionType] = isChecked;
  
    setRole({
      ...role,
      permissions: updatedPermissions
    });
  
    // Check if parent checkbox should be indeterminate or checked
    updateParentCheckboxState(navigationId);
  };

  // Update the parent checkbox state (indeterminate/checked)
  const updateParentCheckboxState = (navigationId) => {
    const permissionKeys = Object.keys(role.permissions[navigationId] || {});
    const allChecked = permissionKeys.every(
      (permissionId) => role.permissions[navigationId][permissionId]
    );
    const someChecked = permissionKeys.some(
      (permissionId) => role.permissions[navigationId][permissionId]
    );

    const parentCheckbox = parentCheckboxRefs.current[navigationId];
    if (parentCheckbox) {
      parentCheckbox.indeterminate = someChecked && !allChecked;
      parentCheckbox.checked = allChecked;
    }
  };

  const handleCheckAllChange = (navigationId, permissionType, isChecked) => {
    const updatedPermissions = { ...role.permissions };
  
    // Recursive function to apply permission to all children
    const applyPermissionToChildren = (parentId, children) => {
      children.forEach((child) => {
        if (!updatedPermissions[parentId]) {
          updatedPermissions[parentId] = {};
        }
  
        if (!updatedPermissions[parentId][child.id]) {
          updatedPermissions[parentId][child.id] = {};
        }
  
        updatedPermissions[parentId][child.id][permissionType] = isChecked;
  
        // Recurse if child has its own children
        if (child.children && child.children.length > 0) {
          applyPermissionToChildren(child.id, child.children);
        }
      });
    };
  
    // Find the top-level navigation
    const parentNav = navigations.find((nav) => nav.id === navigationId);
    if (parentNav && parentNav.children) {
      applyPermissionToChildren(navigationId, parentNav.children);
    }
  
    setRole({
      ...role,
      permissions: updatedPermissions
    });
  };  

  // Handle the "Is Super Admin" checkbox change
  const handleSuperAdminChange = (isChecked) => {
    setIsSuperAdmin(isChecked);
  
    if (isChecked) {
      const allPermissions = {};
  
      const applyPermissions = (parentId, children) => {
        children.forEach((child) => {
          if (!allPermissions[parentId]) {
            allPermissions[parentId] = {};
          }
  
          if (!allPermissions[parentId][child.id]) {
            allPermissions[parentId][child.id] = {};
          }
  
          allPermissions[parentId][child.id] = {
            can_view: true,
            can_create: true,
            can_edit: true,
            can_delete: true,
          };
  
          // Recurse if the child has children
          if (child.children && child.children.length > 0) {
            applyPermissions(child.id, child.children);
          }
        });
      };
  
      // Loop through all top-level navigations
      navigations.forEach((nav) => {
        if (nav.children && nav.children.length > 0) {
          applyPermissions(nav.id, nav.children);
        }
      });
  
      setRole({
        ...role,
        permissions: allPermissions,
      });
    } else {
      // Clear all permissions if unchecked
      setRole({
        ...role,
        permissions: {},
      });
    }
  };
  
  // Render checkboxes dynamically
  const renderPermissions = () => {
    const renderNavigationRow = (item, parentId = null, level = 0) => {
      const paddingLeft = `${level * 20}px`;
      const hasChildren = item.children && item.children.length > 0;
      const isTopLevel = level === 0;
  
      // Only for top-level items, calculate if all children are checked
      const calculateAllChecked = (permissionType) => {
        if (!hasChildren) return false;
        return item.children.every((child) => {
          return role.permissions[item.id]?.[child.id]?.[permissionType] === true;
        });
      };
  
      return (
        <div key={item.id}>
          <div className="row" style={{ paddingTop: '5px' }}>
            {/* Label */}
            <div
              className="col-md-3"
              style={{ whiteSpace: "nowrap", padding: "5px 0", paddingLeft }}
            >
              <label style={{ fontWeight: isTopLevel ? "bold" : "normal" }}>
                {item.name}
              </label>
            </div>
  
            {/* Permission Checkboxes */}
            {["can_view", "can_create", "can_edit", "can_delete"].map((perm) => (
              <div
                key={perm}
                className="col-md-2 d-flex justify-content-center align-items-center"
              >
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                      isTopLevel
                        ? calculateAllChecked(perm)
                        : role.permissions[parentId ?? item.id]?.[item.id]?.[perm] || false
                    }
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (isTopLevel) {
                        handleCheckAllChange(item.id, perm, isChecked);
                      } else {
                        handlePermissionChange(parentId ?? item.id, item.id, perm, isChecked);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
  
          {/* Render Children Recursively */}
          {hasChildren &&
            item.children.map((child) =>
              renderNavigationRow(child, item.id, level + 1)
            )}
        </div>
      );
    };
  
    return (
      <div>
        {/* Header Row */}
        <div className="row">
          <div className="col-md-2 offset-md-3 d-flex justify-content-center pb-1">
            <strong>Can View</strong>
          </div>
          <div className="col-md-2 d-flex justify-content-center pb-1">
            <strong>Can Create</strong>
          </div>
          <div className="col-md-2 d-flex justify-content-center pb-1">
            <strong>Can Edit</strong>
          </div>
          <div className="col-md-2 d-flex justify-content-center pb-1">
            <strong>Can Delete</strong>
          </div>
        </div>
  
        {/* Top-Level Navigation Rows */}
        {navigations.map((nav) => (
          <div
            key={nav.id}
            style={{ borderTop: "2px solid #ccc", paddingTop: "5px" }}
          >
            {renderNavigationRow(nav)}
          </div>
        ))}
      </div>
    );
  };    

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setIsLoading(true);

    role.active = isActive;
    role.is_super_admin = isSuperAdmin;

    const request = role.id 
      ? axiosClient.put(`/user-management/roles/${role.id}`, role)
      : axiosClient.post('/user-management/roles', role);

    request
    .then(() => {
      const action = role.id ? 'updated' : 'added';
      toastAction.current.showToast(`Role has been ${action}.`, 'success');
      setIsLoading(false);
      setTimeout(() => navigate('/user-management/roles'), 2000);
    })
    .catch((errors) => {
      toastAction.current.showError(errors.response);
      setIsLoading(false); // Ensure loading state is cleared
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!role.id) return;
    
    if (window.confirm('Are you sure you want to delete this role?')) {
      setIsLoading(true);
      axiosClient.delete(`/user-management/roles/${role.id}`)
        .then(() => {
          toastAction.current.showToast('Role has been deleted.', 'success');
          setIsLoading(false);
          setTimeout(() => navigate('/user-management/roles'), 2000);
        })
        .catch((errors) => {
          toastAction.current.showError(errors.response);
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    // Get navigations
    axiosClient.get(`/options/routes`)
    .then(({ data }) => {
      setNavigations(data.data);
    })
    .catch((errors) => {
      toastAction.current.showError(errors.response);
    });

    if (id) {
      setButtonText('Save');
      setIsLoading(true);
      axiosClient.get(`/user-management/roles/${id}`)
      .then(({ data }) => {
        setRole(data);
        setIsActive(data.active);
        setIsSuperAdmin(data.is_super_admin);
        setIsLoading(false);        
      })
      .catch((errors) => {
        toastAction.current.showError(errors.response);
        setIsLoading(false); // Ensure loading state is cleared
      });
    }
  }, [id]);

  return (
    <>
    <div className="card mb-2">
      <form onSubmit={handleSubmit}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>
            {role.id ? 'Edit Role' : 'Create New Role'}
          </h4>
          {!role.id && <p className="tip-message mb-0">Create a new Role and add them to this site.</p>}
        </div>
        <div className="card-body">
          {/* Name Field */}
          <Field
            label="Name"
            required={true}
            inputComponent={
              <input 
                className="form-control" 
                type="text" 
                value={role.name} 
                onChange={ev => {setRole({...role, name : DOMPurify.sanitize(ev.target.value)}); }}
                required
              />
            }
            tipMessage="The name is how it appears on your site."
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Active Field */}
          <Field
            label="Active"
            inputComponent={
              <input
                className="form-check-input"
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          {/* Super Admin Field */}
          <Field
            label="Is Super Admin"
            inputComponent={
              <input
                className="form-check-input"
                type="checkbox"
                checked={isSuperAdmin}
                onChange={(e) => handleSuperAdminChange(e.target.checked)}
              />
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
          <hr/>
          {/* Permissions Field */}
          <Field
            label="Permissions"
            inputComponent={
              <div className="row">{renderPermissions()}</div>
            }
            labelClass="col-sm-12 col-md-3"
            inputClass="col-sm-12 col-md-9"
          />
        </div>
        <div className="card-footer d-flex justify-content-between">
          <div>
            <Link type="button" to="/user-management/roles" className="btn btn-secondary">
              <FontAwesomeIcon icon={solidIconMap.arrowleft} className="me-2" />
              Cancel
            </Link> &nbsp;
            <button type="submit" className="btn btn-primary">
              <FontAwesomeIcon icon={solidIconMap.save} className="me-2" />
              {buttonText} &nbsp;
              {isLoading && <span className="spinner-border spinner-border-sm ml-1" role="status"></span>}
            </button>
          </div>
          {role.id && (
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={solidIconMap.trash} className="me-2" />
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
    <ToastMessage ref={toastAction}/>
    </>
  );
}