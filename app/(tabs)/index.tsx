import { Link, Stack } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useMedia } from '../providers/MediaProvider';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getImagekitUrlFromPath } from '~/utils/imagekit';

export default function Home() {
const { assets, loadLocalAssets, loading } = useMedia()
  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={assets}
        numColumns={4}
        showsVerticalScrollIndicator={true}
        contentContainerClassName='gap-[2px]'
        columnWrapperClassName='gap-[2px]'
        onEndReached={() => loadLocalAssets() }
        // onEndReachedThreshold={0.5}
        refreshing={loading}
        renderItem={({ item }) => 
          <Link href={`/asset?id=${item.id}`} asChild>
            <Pressable style={{ width: '25%'}} className='relative'>
            <Image source={{ uri: item?.isLocalAsset ? item.uri: getImagekitUrlFromPath(item?.path, []) }} style={{ width: '100%', aspectRatio: 1}}/>
            {!item.isBackedUp && item?.isLocalAsset && (
              <AntDesign name="cloudupload" size={24} color="white" className='absolute bottom-1 right-1' />
            )}
            </Pressable>
        </Link>
      }
        keyExtractor={(item) => item.id}
      />
    </>
  );
}