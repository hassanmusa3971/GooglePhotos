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
  console.log("Asset Path: ", asset)

  if (!asset) {
    return <Text>No Asset Found</Text>;
  }

  let uri;
  if(asset.isLocalAsset){
    uri = asset.uri
  }else{
    uri = getImagekitUrlFromPath(asset?.path,[{ width: 200, height: 200}])
  }
  
  return (
    <>
    <Stack.Screen options={{ title: 'Photo', headerRight: () => {
      return (<AntDesign onPress={() => syncToCloud(asset)} name="cloudupload" size={24} color="black" />)
    }}} />
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
      />
    </>
  );
};

export default AssetPage;
