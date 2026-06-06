import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';

function useAutenticacio() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}export { useAutenticacio };

function useEstaConnectat() {
  const { isLoggedIn } = useAutenticacio();
  return isLoggedIn;
}export { useEstaConnectat };

function useDadesUsuari() {
  const { getUserInfo } = useAutenticacio();
  return getUserInfo();
}export { useDadesUsuari };