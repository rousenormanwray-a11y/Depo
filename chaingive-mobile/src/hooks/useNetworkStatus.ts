import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { showToast } from '../components/common/Toast';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? false;
      
      setIsConnected(connected);
      setIsInternetReachable(reachable);
      
      // Show toast on connection change
      if (!connected && isConnected) {
        showToast('No internet connection', 'error');
      } else if (connected && !isConnected) {
        showToast('Back online!', 'success');
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  return { 
    isConnected, 
    isInternetReachable,
    isOnline: isConnected && isInternetReachable,
  };
};
