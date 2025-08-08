import { useStateContext } from '../contexts/AuthProvider';
import AccessHelper from '../utils/AccessHelper';

export const useAccess = () => {
  const { user, userRoutes } = useStateContext();
  // Create instance once per hook call
  const accessHelper = new AccessHelper(user, userRoutes);

  // Return the helper so you can call any method you want
  return accessHelper;
};