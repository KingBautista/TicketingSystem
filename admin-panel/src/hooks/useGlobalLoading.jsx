import { useLoading } from '../contexts/LoadingContext';

export const useGlobalLoading = () => {
  const { startLoading, stopLoading } = useLoading();

  const withLoading = async (key, message, asyncFunction) => {
    startLoading(key, message);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading(key);
    }
  };

  return {
    startLoading,
    stopLoading,
    withLoading
  };
}; 