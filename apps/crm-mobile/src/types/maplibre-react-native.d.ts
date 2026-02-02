declare module "@maplibre/maplibre-react-native" {
  import type { ViewProps } from "react-native";

  export type MapViewProps = ViewProps & {
    children?: React.ReactNode;

    styleURL?: string;
    logoEnabled?: boolean;
    attributionEnabled?: boolean;

    onDidFinishLoadingMap?: () => void;
    onDidFailLoadingMap?: () => void;

    onDidFinishLoadingStyle?: () => void;
  };

  export type CameraProps = {
    children?: React.ReactNode;

    zoomLevel?: number;
    centerCoordinate?: [number, number];

    animationMode?: "flyTo" | "easeTo" | "moveTo";
    animationDuration?: number;
  };

  export type PointAnnotationProps = {
    children?: React.ReactNode;
    id: string;
    coordinate: [number, number];
    draggable?: boolean;
    onDragEnd?: (payload: any) => void;
  };

  export const MapView: React.ComponentType<MapViewProps>;
  export const Camera: React.ComponentType<CameraProps>;
  export const PointAnnotation: React.ComponentType<PointAnnotationProps>;

  export function setAccessToken(token: string): void;

  const MapLibreGL: {
    setAccessToken: typeof setAccessToken;
    MapView: typeof MapView;
    Camera: typeof Camera;
    PointAnnotation: typeof PointAnnotation;
  };

  export default MapLibreGL;
}