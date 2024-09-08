import { Stack, useGlobalSearchParams } from 'expo-router';
import { useMedia } from './providers/MediaProvider';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import AntDesign from '@expo/vector-icons/AntDesign';

const AssetPage = () => {
  const { id } = useGlobalSearchParams<{id:string}>();
  const { getAssetById, syncToCloud } = useMedia();
  const asset = getAssetById(id);

  if (!asset) {
    return <Text>No Asset Found</Text>;
  }
  return (
    <>
    <Stack.Screen options={{ title: 'Photo', headerRight: () => {
      return (<AntDesign onPress={() => syncToCloud(asset)} name="cloudupload" size={24} color="black" />)
    }}} />
      <Image
        source={{ uri: asset.uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
      />
    </>
  );
};

export default AssetPage;
