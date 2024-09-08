import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import mime from 'mime'
import { supabase } from '~/utils/supabase';
import { useAuth } from './AuthProvider';

type MediaContext = {
  localAssets: MediaLibrary.Asset[];
  endCursor: string;
  loading: boolean;
  loadLocalAssets: () => Promise<void>;
  getAssetById: (id: string) => MediaLibrary.Asset | undefined;
  syncToCloud: (asset: MediaLibrary.Asset) => Promise<void>;
};

const MediaContext = createContext<MediaContext>({
  localAssets: [],
  endCursor: '',
  loading: false,
  loadLocalAssets: async() => {},
  getAssetById: () => undefined,
  syncToCloud: async () => {},
});

export const MediaContextProvider = ({ children }: PropsWithChildren) => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [remoteAsset, setRemoteAsset] = useState([])

const assets = [
  ...remoteAsset,
  ...localAssets.filter((asset) => asset.isBackedUp === false)
]
console.log("Marge Array: ", JSON.stringify(assets, null, 2))
  const { user } = useAuth()
  useEffect(() => {
    loadRemoteAssets()
  },[])

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

  const loadRemoteAssets = async() => {
    const{ data, error } = await supabase.from('assets').select('*')
    // console.log("Remote Images:",JSON.stringify(data, null, 2))
    setRemoteAsset(data)
  }

  const loadLocalAssets = async () => {
    try {
      if (loading || !hasNextPage){
        return;
      }
      setLoading(true);
      const assetPage = await MediaLibrary.getAssetsAsync({
        ...(endCursor ? { after: endCursor } : { first: 30 }),
      });
      const newAssets = await Promise.all(assetPage.assets.map(async(asset) => {
        const { count } = await supabase.from('assets').select('*',{count: 'exact', head: true}).eq('asset_id', asset.id)
        return{
          ...asset,
          isBackedUp: !!count && count > 0,
          isLocalAsset: true,
        }
       
        }))
        setLocalAssets((existingItems) => [...existingItems, ...newAssets]);
      setHasNextPage(assetPage.hasNextPage);
      setEndCursor(assetPage.endCursor);
      setLoading(false);
    } catch (error) {
      console.warn(error)
    }
    
  };

 
  const getAssetById = (id: string) => {
    return assets.find((asset) => asset.id === id);
  };

  const syncToCloud = async (asset: MediaLibrary.Asset) => {
    const info = await MediaLibrary.getAssetInfoAsync(asset);
    if (!info.localUri || !user?.id) return;
    const base64String = await FileSystem.readAsStringAsync(info.localUri, { encoding: 'base64' });
    const base64ArrayBuffer = decode(base64String);
    const { data:storeFile, error:uploadError } = await supabase.storage
      .from('assets')
      .upload(`${user?.id}/${asset.filename}`, base64ArrayBuffer, {
        contentType: mime.getType(asset.filename) ?? 'image/jpeg',
        upsert: true,
      });

    const{ data, error } = await supabase.from('assets').upsert({
      path: storeFile?.path,
      user_id: user?.id,
      object_id: storeFile?.id,
      mediaType: asset?.mediaType,
      asset_id: asset?.id,
    }).select('*').single()
    console.log(data)
    console.log(error)
  };
  return (
    <MediaContext.Provider
      value={{ assets, loadLocalAssets, loading, getAssetById, syncToCloud }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
