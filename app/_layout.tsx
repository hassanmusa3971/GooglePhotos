import '../global.css';

import { Stack } from 'expo-router';
import { MediaContextProvider } from './providers/MediaProvider';
import { AuthContextProvider } from './providers/AuthProvider';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
    <MediaContextProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
    </MediaContextProvider>
    </AuthContextProvider>
  );
}
