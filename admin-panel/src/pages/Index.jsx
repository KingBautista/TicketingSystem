import { Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';

// Dynamically import pages
const Dashboard = lazy(() => import('./Dashboard'));

const Users = lazy(() => import('./user-management/Users'));
const UserForm = lazy(() => import('./user-management/UserForm'));
const Roles = lazy(() => import('./user-management/Roles'));
const RoleForm = lazy(() => import('./user-management/RoleForm'));
const Profile = lazy(() => import('./user-management/Profile'));

const Library = lazy(() => import('./content-management/Library'));
const LibraryForm = lazy(() => import('./content-management/LibraryForm'));
const MediaForm = lazy(() => import('./content-management/MediaForm'));

const Navigations = lazy(() => import('./system-settings/Navigations'));
const NavigationForm = lazy(() => import('./system-settings/NavigationForm'));

// Mapping paths to components
const routeMap = {
  '/dashboard': Dashboard,
  '/user-management/users': Users,
  '/user-management/users/create': UserForm,
  '/user-management/users/:id': UserForm,
  '/user-management/roles': Roles,
  '/user-management/roles/create': RoleForm,
  '/user-management/roles/:id': RoleForm,
  '/content-management/media-library': Library,
  '/content-management/media-library/upload': LibraryForm,
  '/content-management/media-library/:id': MediaForm,
  '/system-settings/navigation': Navigations,
  '/system-settings/navigation/create': NavigationForm,
  '/system-settings/navigation/:id': NavigationForm,
  '/profile': Profile,
};

const Index = () => {
  const location = useLocation();

  // Helper function to determine which component to render
  const getComponentToRender = () => {
    // Get the current pathname
    const currentPath = location.pathname;
  
    // Sort routes by length in descending order so the longest match comes first
    const sortedRoutes = Object.keys(routeMap).sort((a, b) => b.length - a.length);
  
    // Find the first route that matches the current path
    const matchedRoute = sortedRoutes.find((path) => {
      // Convert the route with dynamic params (e.g. /:id) to a regular expression
      const regexPath = path.replace(/:([^/]+)/g, '([^/]+)'); // Convert ":id" to a regex capturing group
      const pathRegex = new RegExp(`^${regexPath}$`);
      return pathRegex.test(currentPath);
    });
    
    // Return the corresponding component from the routeMap if a match is found, otherwise null
    return matchedRoute ? routeMap[matchedRoute] : null;
  };

  const ComponentToRender = getComponentToRender();

  return (
    <>
      <Suspense fallback={<div className="col-12 text-center">Loading...</div>}>
        {ComponentToRender ? <ComponentToRender /> : <div className="card text-center p-5"><h4>404 - Page Not Found</h4></div> }
      </Suspense>
    </>
  );
};

export default Index;