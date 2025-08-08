class AccessHelper {
  constructor(user, userRoutes) {
    this.user = user;
    this.userRoutes = userRoutes;
    // Parse user_role if it is a string
    let userRoleObj = user?.user_role;
    if (typeof userRoleObj === 'string') {
      try {
        userRoleObj = JSON.parse(userRoleObj);
      } catch (error) {
        console.error('Failed to parse user_role:', error);
        userRoleObj = null;
      }
    }
  
    // Now parse permissions inside userRoleObj (which may also be string)
    this.permissions = this.parsePermissions(userRoleObj?.permissions);
  }

  parsePermissions(permissionsStr) {
    try {
      return typeof permissionsStr === 'string'
        ? JSON.parse(permissionsStr)
        : permissionsStr || {};
    } catch (error) {
      console.error('Failed to parse permissions:', error);
      return {};
    }
  }

  // Check if user is a developer/admin with full access
  isDeveloper() {
    const userRole = this.user?.user_role;
    if (typeof userRole === 'string') {
      try {
        const parsedRole = JSON.parse(userRole);
        return parsedRole?.name?.toLowerCase().includes('admin') || 
               parsedRole?.name?.toLowerCase().includes('developer') ||
               parsedRole?.name?.toLowerCase().includes('super');
      } catch (error) {
        return false;
      }
    }
    return userRole?.name?.toLowerCase().includes('admin') || 
           userRole?.name?.toLowerCase().includes('developer') ||
           userRole?.name?.toLowerCase().includes('super');
  }

  matchPath(routePath, currentPath) {
    const routeSegments = routePath.split('/').filter(Boolean);
    const currentSegments = currentPath.split('/').filter(Boolean);

    if (routeSegments.length !== currentSegments.length) return false;

    return routeSegments.every((segment, i) => {
      return segment.startsWith(':') || segment === currentSegments[i];
    });
  }

  findRouteWithParent(items, targetPath, parentId = null) {
    for (const item of items) {
      if (item.path && this.matchPath(item.path, targetPath)) {
        return {
          parentId,
          childId: item.id,
          name: item.name,
          icon: item.icon || ''
        };
      }

      if (item.children && item.children.length > 0) {
        const found = this.findRouteWithParent(item.children, targetPath, item.id);
        if (found) return found;
      }
    }
    return null;
  }

  hasAccess(pathname = window.location.pathname) {
    // If user is developer/admin, grant full access
    if (this.isDeveloper()) {
      return {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        route: {
          name: 'Developer Access',
          icon: '',
          parentId: 'developer',
          childId: 'full_access'
        }
      };
    }

    // If no userRoutes, grant basic access (fallback for development)
    if (!this.userRoutes || this.userRoutes.length === 0) {
      console.warn('No userRoutes found, granting basic access for development');
      return {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        route: {
          name: 'Development Access',
          icon: '',
          parentId: 'dev',
          childId: 'basic_access'
        }
      };
    }

    const route = this.findRouteWithParent(this.userRoutes, pathname);
    if (!route) {
      // If no specific route found, check if user has any permissions
      const hasAnyPermissions = Object.keys(this.permissions).length > 0;
      
      if (hasAnyPermissions) {
        // User has permissions but no specific route match - deny access
        return {
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false,
          route: null
        };
      } else {
        // No permissions defined - grant basic access for development
        console.warn('No permissions defined, granting basic access for development');
        return {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          route: {
            name: 'Development Access',
            icon: '',
            parentId: 'dev',
            childId: 'basic_access'
          }
        };
      }
    }

    const { parentId, childId, name, icon } = route;
    const access = this.permissions?.[parentId]?.[childId];

    return {
      can_view: !!access?.can_view,
      can_create: !!access?.can_create,
      can_edit: !!access?.can_edit,
      can_delete: !!access?.can_delete,
      route: {
        name,
        icon,
        parentId,
        childId
      }
    };
  }
}

export default AccessHelper;