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
    const route = this.findRouteWithParent(this.userRoutes, pathname);
    if (!route) {
      return {
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        route: null
      };
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