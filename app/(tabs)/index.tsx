import { Stack } from 'expo-router';
import { FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useMedia } from '../providers/MediaProvider';

export default function Home() {
const { localAssets, loadLocalAssets, endCursor, loading } = useMedia()

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