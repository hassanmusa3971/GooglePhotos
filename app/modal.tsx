import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Button } from '~/components/Button';
import { supabase } from '~/utils/supabase';

export default function Modal() {
  return (
    <>
      <Button title='Sign out' onPress={async() => await supabase.auth.signOut()}/>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
