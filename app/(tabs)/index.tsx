import { Stack } from 'expo-router';
import { FlatList, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';

export default function Home() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
     loadLocalAssetsOnPage()
    }
  }, [permissionResponse]);

  const loadLocalAssetsOnPage = async() => {
    if (loading || !hasNextPage) return;
    setLoading(true);
    const assetPage = await MediaLibrary.getAssetsAsync({ first: 30 })
    setLocalAssets(assetPage.assets)
    setHasNextPage(assetPage.hasNextPage);
    setEndCursor(assetPage.endCursor);
    setLoading(false);
  }


  const loadLocalAssets = async (assetId:string) => {
    if(!hasNextPage || !assetId) return
    const assetPage = await MediaLibrary.getAssetsAsync({after: assetId});
    setLocalAssets((existingItems) => [...existingItems, ...assetPage.assets]);
    setHasNextPage(assetPage.hasNextPage);
    setEndCursor(assetPage.endCursor);   
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={localAssets}
        numColumns={4}
        contentContainerClassName='gap-[2px]'
        columnWrapperClassName='gap-[2px]'
        onEndReached={() =>loadLocalAssets(endCursor)}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        renderItem={({ item }) => <Image source={{ uri: item.uri }} style={{ width: '25%', aspectRatio: 1}}/>}
        keyExtractor={(item) => item.id}
      />
    </>
  );
}