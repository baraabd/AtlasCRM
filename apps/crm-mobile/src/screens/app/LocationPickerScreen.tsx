import { Ionicons } from '@expo/vector-icons';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { ScreenProps } from '../../navigation/types';
import { useLeadsCtx } from '../../state/LeadsContext';

const mapLibreAny = MapLibreGL as any;
const MapView = mapLibreAny.MapView;
const Camera = mapLibreAny.Camera;
const PointAnnotation = mapLibreAny.PointAnnotation;
const RasterSource = mapLibreAny.RasterSource;
const RasterLayer = mapLibreAny.RasterLayer;

const GOOGLE_TILE_URL = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

const GooglePin = () => (
  <View style={styles.pinContainer}>
    <View style={styles.pinHead}>
      <View style={styles.pinInnerHole} />
    </View>
    <View style={styles.pinTriangle} />
    <View style={styles.pinShadow} />
    <View style={styles.pinStick} />
  </View>
);

export function LocationPickerScreen({
  navigation,
  route,
}: ScreenProps<'LocationPicker'>) {
  const { tempData } = route.params;
  const { create, loading } = useLeadsCtx();

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    37.133061, 36.202427,
  ]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapReady, setMapReady] = useState(false);

  const [addressString, setAddressString] = useState<string>(
    'جاري تحديد العنوان...'
  );
  const [isGeocoding, setIsGeocoding] = useState(false);

  const pinDetails = useMemo(() => {
    const data = tempData as any;
    const name = data?.name || 'عميل جديد';
    const phones = data?.phones;
    const phone =
      Array.isArray(phones) && phones.length > 0
        ? String(phones[0])
        : '---';
    const businessType = data?.businessType || 'شركة تجارية';
    return { name, phone, businessType };
  }, [tempData]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (loc?.coords) {
          setUserLocation([loc.coords.longitude, loc.coords.latitude]);
        }
      }
    })();
  }, []);

  useEffect(() => {
    setIsGeocoding(true);
    setAddressString('جاري التحديث...');

    const timer = setTimeout(() => {
      setAddressString('حي الجميلية، شارع القدس، حلب');
      setIsGeocoding(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [mapCenter]);

  const onRegionDidChange = (feature: any) => {
    const center = feature?.properties?.center;
    if (center && Array.isArray(center)) {
      setMapCenter([center[0], center[1]]);
    }
  };

  const goToMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      Alert.alert('تنبيه', 'جاري تحديد موقعك الحالي...');
    }
  };

  const handleConfirm = async () => {
    if (loading) return;
    try {
      const payload = {
        ...(tempData as any),
        location: {
          longitude: mapCenter[0],
          latitude: mapCenter[1],
        },
        address:
          addressString !== 'جاري التحديث...' ? addressString : undefined,
        city: 'Aleppo',
      };

      await create(payload);
      navigation.navigate('Dashboard');
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'فشل عملية الحفظ، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleJSON={JSON.stringify({ version: 8, sources: {}, layers: [] })}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onRegionDidChange={onRegionDidChange}
      >
        <Camera
          zoomLevel={16}
          centerCoordinate={mapCenter}
          animationMode="flyTo"
          animationDuration={400}
        />
        <RasterSource
          id="google-source"
          tileUrlTemplates={[GOOGLE_TILE_URL]}
          tileSize={256}
        >
          <RasterLayer
            id="google-layer"
            sourceID="google-source"
            style={{ rasterOpacity: 1 } as any}
          />
        </RasterSource>

        {userLocation && (
          <PointAnnotation id="user-loc" coordinate={userLocation}>
            <View style={styles.userDotContainer}>
              <View style={styles.userDot} />
              <View style={styles.userDotPulse} />
            </View>
          </PointAnnotation>
        )}
      </MapView>

      <View style={styles.centerMarkerOverlay} pointerEvents="none">
        <GooglePin />
      </View>

      {!mapReady && (
        <View style={styles.loaderBox}>
          <ActivityIndicator color="#EA4335" />
          <Text style={styles.loaderText}>تحميل الخريطة...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.gpsButton} onPress={goToMyLocation}>
        <Ionicons name="locate" size={24} color="#2563EB" />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase" size={22} color="#EA4335" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {pinDetails.name}
            </Text>

            <View style={styles.addressRow}>
              <Ionicons
                name="location-sharp"
                size={12}
                color="#6B7280"
                style={styles.locationIcon}
              />
              <Text
                style={[
                  styles.sheetSub,
                  isGeocoding && styles.sheetSubActive,
                ]}
                numberOfLines={1}
              >
                {addressString}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.detailText}>{pinDetails.phone}</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6B7280"
            />
            <Text style={styles.detailText}>{pinDetails.businessType}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveBtnText}>حفظ بيانات العميل</Text>
              <Ionicons
                name="save-outline"
                size={20}
                color="#fff"
                style={styles.saveIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  map: { flex: 1 },
  sheetSub: { fontSize: 13, flex: 1, textAlign: 'left', color: '#6B7280' },
  sheetSubActive: { color: '#EA4335' },
  
  centerMarkerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginTop: -35,
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B31412',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  pinInnerHole: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#89110F',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EA4335',
    marginTop: -2,
  },
  pinShadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 4,
    transform: [{ scaleX: 1.5 }],
  },
  pinStick: {
    width: 2,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: -2,
  },

  userDotContainer: { alignItems: 'center', justifyContent: 'center' },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  userDotPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    zIndex: 1,
  },

  loaderBox: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    zIndex: 20,
  },
  loaderText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },

  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 20,
  },
  gpsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 20,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    zIndex: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerTextContainer: { flex: 1 },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'left',
  },

  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationIcon: { marginRight: 4 },

  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
  },

  saveBtn: {
    backgroundColor: '#EA4335',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#EA4335',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  disabledBtn: { backgroundColor: '#ccc', elevation: 0 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveIcon: { marginLeft: 8 },
});