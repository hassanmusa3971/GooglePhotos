import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, TextInput } from 'react-native';
import { supabase } from '~/utils/supabase';
import { Button } from '~/components/Button';
import { useAuth } from '../providers/AuthProvider';
import { Redirect } from 'expo-router';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  console.log(user);
  if (user) return <Redirect href="/(tabs)" />;

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="gap-3 p-5 flex flex-1 justify-center">
      <TextInput
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email@address.com"
        autoCapitalize={'none'}
        className="rounded-md border border-gray-300 p-3"
      />
      <TextInput
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
        autoCapitalize={'none'}
        className="rounded-md border border-gray-300 p-3"
      />
      <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});

export default LoginScreen;
