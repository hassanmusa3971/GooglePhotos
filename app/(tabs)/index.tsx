import { Stack } from 'expo-router';
import { FlatList, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';

export default function Home() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
      loadLocalAssets();
    }
  }, [permissionResponse]);

  const loadLocalAssets = async () => {
    const { assets, totalCount } = await MediaLibrary.getAssetsAsync();
    setAssets(assets);
    console.log(JSON.stringify(assets, null, 2));
    console.log(totalCount);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={assets}
        numColumns={4}
        contentContainerClassName='gap-[2px]'
        columnWrapperClassName='gap-[2px]'
        renderItem={({ item }) => <Image source={{ uri: item.uri }} style={{ width: '25%', aspectRatio: 1}}/>}
        keyExtractor={(item) => item.id}
      />
    </>
  );
}