import { Link, Stack } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
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
        renderItem={({ item }) => 
          <Link href={`/asset?id=${item.id}`} asChild>
            <Pressable style={{ width: '25%'}}>
            <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1}}/>
            </Pressable>
        </Link>
      }
        keyExtractor={(item) => item.id}
      />
    </>
  );
}