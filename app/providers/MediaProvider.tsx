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
  loadLocalAssets: (assetId: string) => void;
  getAssetById: (id: string) => MediaLibrary.Asset | undefined;
  syncToCloud: (asset: MediaLibrary.Asset) => Promise<void>;
};

const MediaContext = createContext<MediaContext>({
  localAssets: [],
  endCursor: '',
  loading: false,
  loadLocalAssets: () => {},
  getAssetById: () => undefined,
  syncToCloud: async () => {},
});

export const MediaContextProvider = ({ children }: PropsWithChildren) => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth()
  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
      loadLocalAssetsOnPage();
    }
  }, [permissionResponse]);

  const loadLocalAssetsOnPage = async () => {
    if (loading || !hasNextPage) return;
    setLoading(true);
    const assetPage = await MediaLibrary.getAssetsAsync({ first: 30 });
    setLocalAssets(assetPage.assets);
    setHasNextPage(assetPage.hasNextPage);
    setEndCursor(assetPage.endCursor);
    setLoading(false);
  };

  const loadLocalAssets = async (assetId: string) => {
    if (loading || !hasNextPage || !assetId) return;
    setLoading(true);
    const assetPage = await MediaLibrary.getAssetsAsync({ after: assetId });
    setLocalAssets((existingItems) => [...existingItems, ...assetPage.assets]);
    setHasNextPage(assetPage.hasNextPage);
    setEndCursor(assetPage.endCursor);
    setLoading(false);
  };

  const getAssetById = (id: string) => {
    return localAssets.find((asset) => asset.id === id);
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
      value={{ localAssets, endCursor, loadLocalAssets, loading, getAssetById, syncToCloud }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
