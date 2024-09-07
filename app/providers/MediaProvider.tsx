import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import * as MediaLibrary from 'expo-media-library';



type MediaContext = {
      localAssets: MediaLibrary.Asset[],
      endCursor: string,
      loading: boolean,
      loadLocalAssets: (assetId:string) => void,
      getAssetById: (id:string) => MediaLibrary.Asset | undefined,
}

const MediaContext = createContext<MediaContext>({
      localAssets: [],
      endCursor: '',
      loading: false,
      loadLocalAssets: () => {},
      getAssetById: () => undefined,
})

export const MediaContextProvider = ({ children}: PropsWithChildren ) => {
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
        if(loading ||!hasNextPage || !assetId) return
        setLoading(true);
        const assetPage = await MediaLibrary.getAssetsAsync({after: assetId});
        setLocalAssets((existingItems) => [...existingItems, ...assetPage.assets]);
        setHasNextPage(assetPage.hasNextPage);
        setEndCursor(assetPage.endCursor);   
        setLoading(false)
      };

      const getAssetById = (id:string) => {
        return localAssets.find((asset) => asset.id === id)
      }
      return (
            <MediaContext.Provider value={{localAssets, endCursor, loadLocalAssets, loading, getAssetById}}>{children}</MediaContext.Provider>
      )
}

export const useMedia = () => useContext(MediaContext)