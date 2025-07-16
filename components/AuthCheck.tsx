import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useUserStore } from '../zustand/userStore';
import { ThemedText } from './ThemedText';

interface AuthCheckProps {
  children: React.ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated, userData } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if the store has been hydrated from persistent storage
    const checkHydration = () => {
      // If we have user data or we're explicitly not authenticated, we're hydrated
      if (userData !== null || isAuthenticated === false) {
        setIsHydrated(true);
      }
    };

    // Check immediately
    checkHydration();

    // Also check after a short delay to ensure hydration is complete
    const timer = setTimeout(checkHydration, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, userData]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 16 }}>Loading...</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
} 