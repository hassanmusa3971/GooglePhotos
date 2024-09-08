import { Stack, useGlobalSearchParams } from 'expo-router';
import { useMedia } from './providers/MediaProvider';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getImagekitUrlFromPath } from '~/utils/imagekit';

const AssetPage = () => {
  const { id } = useGlobalSearchParams<{id:string}>();
  const { getAssetById, syncToCloud } = useMedia();
  const asset = getAssetById(id);

  if (!asset) {
    return <Text>No Asset Found</Text>;
  }
  const url = getImagekitUrlFromPath('23338271-3b23-49fe-9ea0-2f86052d3075/ELIZBETH%20FLIGHT-2.jpg',[{ width: 200, height: 200}])
  return (
    <>
    <Stack.Screen options={{ title: 'Photo', headerRight: () => {
      return (<AntDesign onPress={() => syncToCloud(asset)} name="cloudupload" size={24} color="black" />)
    }}} />
      <Image
        source={{ uri: url }}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
      />
    </>
  );
};

export default AssetPage;
