import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../config/supabase';

const { width, height } = Dimensions.get('window');

const RouteDetailScreen = ({ navigation, route }) => {
  const [routeData, setRouteData] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  const { routeId, routeName } = route.params || {};

  useEffect(() => {
    if (routeId) {
      fetchRouteDetails();
    } else {
      setLoading(false);
      Alert.alert('Hata', 'Rota ID bulunamadı');
    }
  }, [routeId]);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      
      console.log('RouteDetailScreen - Fetching route details for ID:', routeId);
      
      // Rota detaylarını çek
      const { data: routeData, error: routeError } = await supabase
        .from('rotalar')
        .select('*')
        .eq('id', routeId)
        .single();

      if (routeError) {
        console.error('Rota detayları yüklenirken hata:', routeError);
        Alert.alert('Hata', 'Rota detayları yüklenemedi');
        return;
      }

      console.log('RouteDetailScreen - Route data:', routeData);
      setRouteData(routeData);

      // Gezi noktalarını çek
      let geziNokIds = [];
      if (routeData.gezi_nok_id) {
        console.log('RouteDetailScreen - Raw gezi_nok_id:', routeData.gezi_nok_id, typeof routeData.gezi_nok_id);
        
        if (typeof routeData.gezi_nok_id === 'string') {
          // String ise virgülle ayrılmış ID'leri parse et
          geziNokIds = routeData.gezi_nok_id.split(',').map(id => id.trim()).filter(id => id);
        } else if (Array.isArray(routeData.gezi_nok_id)) {
          // Array ise direkt kullan
          geziNokIds = routeData.gezi_nok_id;
        } else if (typeof routeData.gezi_nok_id === 'number') {
          // Number ise array'e çevir
          geziNokIds = [routeData.gezi_nok_id.toString()];
        } else if (typeof routeData.gezi_nok_id === 'object' && routeData.gezi_nok_id !== null) {
          // Object ise (JSON) parse etmeye çalış
          try {
            const parsed = JSON.parse(routeData.gezi_nok_id);
            if (Array.isArray(parsed)) {
              geziNokIds = parsed;
            } else if (typeof parsed === 'number') {
              geziNokIds = [parsed.toString()];
            }
          } catch (e) {
            console.log('RouteDetailScreen - Failed to parse gezi_nok_id as JSON:', e);
          }
        }
      }

      console.log('RouteDetailScreen - Parsed gezi_nok_ids:', geziNokIds);

      if (geziNokIds.length > 0) {
        const { data: stopsData, error: stopsError } = await supabase
          .from('gezi_noktalari')
          .select('*')
          .in('id', geziNokIds);

        if (stopsError) {
          console.error('Gezi noktaları yüklenirken hata:', stopsError);
        } else {
          console.log('RouteDetailScreen - Stops data:', stopsData);
          setStops(stopsData || []);
        }
      } else {
        console.log('RouteDetailScreen - No gezi_nok_ids found, trying to get all gezi_noktalari');
        
        // Eğer gezi_nok_id yoksa, tüm gezi noktalarını çek
        const { data: allStopsData, error: allStopsError } = await supabase
          .from('gezi_noktalari')
          .select('*');

        if (allStopsError) {
          console.error('Tüm gezi noktaları yüklenirken hata:', allStopsError);
        } else {
          console.log('RouteDetailScreen - All stops data:', allStopsData);
          setStops(allStopsData || []);
        }
      }

    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSpotDetail = (spot) => {
    // Doğrudan TourismSpotDetail'e yönlendir, araya başka ekran koyma
    navigation.navigate('TourismSpotDetail', { spot });
  };

  const generateMapHTML = () => {
    // Sadece koordinatları olan yerleri filtrele
    const stopsWithCoordinates = stops.filter(stop => {
      const enlem = stop.enlem || stop.latitude || stop.lat;
      const boylam = stop.boylam || stop.longitude || stop.lng;
      
      const hasEnlem = enlem !== null && enlem !== undefined && enlem !== '';
      const hasBoylam = boylam !== null && boylam !== undefined && boylam !== '';
      
      const parsedEnlem = parseFloat(enlem);
      const parsedBoylam = parseFloat(boylam);
      
      const isValidEnlem = !isNaN(parsedEnlem) && parsedEnlem !== 0;
      const isValidBoylam = !isNaN(parsedBoylam) && parsedBoylam !== 0;
      
      const isValid = hasEnlem && hasBoylam && isValidEnlem && isValidBoylam;
      
      if (!isValid) {
        console.log('RouteDetailScreen - Invalid coordinates for stop:', stop.ad || stop.name, {
          enlem: enlem,
          boylam: boylam,
          hasEnlem,
          hasBoylam,
          isValidEnlem,
          isValidBoylam,
          parsedEnlem: parseFloat(enlem),
          parsedBoylam: parseFloat(boylam)
        });
      } else {
        console.log('RouteDetailScreen - Valid coordinates for stop:', stop.ad || stop.name, {
          enlem: parseFloat(enlem),
          boylam: parseFloat(boylam)
        });
      }
      
      return isValid;
    });
    
    console.log('RouteDetailScreen - Stops with coordinates:', stopsWithCoordinates);
    
    const markers = stopsWithCoordinates.map(stop => ({
      lat: parseFloat(stop.enlem || stop.latitude || stop.lat),
      lng: parseFloat(stop.boylam || stop.longitude || stop.lng),
      title: stop.ad || stop.name || 'Bilinmeyen Konum',
      description: stop.aciklama || stop.description || '',
      category: stop.kategori || 'rota'
    }));

    // Harita merkezi ve zoom seviyesi
    let mapCenter = [38.0931, 27.7519]; // Tire merkez koordinatları
    let mapZoom = 10; // Tire bölgesinin tamamını görmek için çok daha geniş zoom
    
    if (markers.length > 0) {
      const latitudes = markers.map(m => m.lat);
      const longitudes = markers.map(m => m.lng);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      mapCenter = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
      mapZoom = 10; // Tire bölgesinin tamamını görmek için çok daha geniş zoom
    }

    console.log('RouteDetailScreen - Map center:', mapCenter);
    console.log('RouteDetailScreen - Map zoom:', mapZoom);
    console.log('RouteDetailScreen - Markers count:', markers.length);

    // Marker verilerini JSON'a çevir ve HTML'e güvenli şekilde göm
    const markersJSON = JSON.stringify(markers);
    const markersHTML = `
      var markers = ${markersJSON};
      console.log('RouteDetailScreen - Markers to add:', markers);
      
      if (markers && markers.length > 0) {
        markers.forEach(function(m, idx){
          try {
            var lat = parseFloat(m.lat);
            var lng = parseFloat(m.lng);
            
            if (isNaN(lat) || isNaN(lng)) {
              console.error('RouteDetailScreen - Invalid coordinates for marker:', m);
              return;
            }
            
            var marker = L.marker([lat, lng]).addTo(map);
            var safeTitle = String(m.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var safeDesc = String(m.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Marker'a tıklandığında React Native'e mesaj gönder
            marker.on('click', function() {
              var messageData = {
                type: 'marker_click',
                place: {
                  ad: m.title,
                  aciklama: m.description,
                  kategori: m.category,
                  enlem: m.lat,
                  boylam: m.lng
                }
              };
              window.ReactNativeWebView.postMessage(JSON.stringify(messageData));
            });
            
            console.log('RouteDetailScreen - Added marker:', safeTitle, 'at', lat, lng);
          } catch (error) {
            console.error('RouteDetailScreen - Error adding marker:', error, m);
          }
        });
      } else {
        console.log('RouteDetailScreen - No markers to add');
      }
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rota Haritası - ${routeName || 'Rota'}</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
          }
          #map { 
            width: 100%; 
            height: 100vh; 
            background-color: #f0f0f0;
          }
          .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            console.log('RouteDetailScreen - Map loading for route: ${routeName || 'Rota'}');
            console.log('RouteDetailScreen - Markers count: ${markers.length}');
            
            // Harita oluştur
            var map = L.map('map').setView([${mapCenter[0]}, ${mapCenter[1]}], ${mapZoom});
            
            // Tile layer ekle
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(map);

            // Marker'ları ekle
            ${markersHTML}
            
            console.log('RouteDetailScreen - Map loaded with ${markers.length} markers for route: ${routeName || 'Rota'}');
            
            // Eğer marker yoksa bilgi mesajı göster
            if (${markers.length} === 0) {
              var infoDiv = document.createElement('div');
              infoDiv.className = 'error-message';
              infoDiv.innerHTML = '<h3>Bu rotada haritada gösterilecek nokta bulunamadı</h3><p>Koordinat bilgilerini kontrol edin.</p>';
              document.body.appendChild(infoDiv);
            }
            
          } catch (error) {
            console.error('RouteDetailScreen - Map error:', error);
            document.body.innerHTML = '<div class="error-message"><h2>Harita Yüklenemedi</h2><p>Lütfen internet bağlantınızı kontrol edin.</p><p>Hata: ' + error.message + '</p></div>';
          }
        </script>
      </body>
      </html>
    `;
    
    console.log('RouteDetailScreen - HTML generated successfully for route:', routeName || 'Rota');
    return htmlContent;
  };

  const renderSpotItem = ({ item }) => {
    const spot = item;
    const imageUrl = spot.resim || spot.image || spot.gorsel;
    
    return (
      <TouchableOpacity 
        style={styles.spotCard}
        onPress={() => navigateToSpotDetail(spot)}
      >
        <View style={styles.spotImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.spotImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.spotImagePlaceholder}>
              <Icon name="photo" size={40} color="#2E5266" />
            </View>
          )}
        </View>
        
        <View style={styles.spotInfo}>
          <Text style={styles.spotName} numberOfLines={1}>
            {spot.ad || spot.name || 'Bilinmeyen Konum'}
          </Text>
          
          
          {spot.aciklama && (
            <Text style={styles.spotDescription} numberOfLines={2}>
              {spot.aciklama}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E5266" />
        <Text style={styles.loadingText}>Rota detayları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          key={`route-${routeId}`} // Route değiştiğinde WebView'i yeniden oluştur
          source={{ html: generateMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => {
            console.log('RouteDetailScreen - WebView loading started for route:', routeName || routeId);
          }}
          onLoadEnd={() => {
            console.log('RouteDetailScreen - WebView loaded for route:', routeName || routeId);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('RouteDetailScreen - WebView error:', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('RouteDetailScreen - WebView HTTP error:', nativeEvent);
          }}
          onMessage={(event) => {
            console.log('RouteDetailScreen - WebView message:', event.nativeEvent.data);
            
            try {
              const messageData = JSON.parse(event.nativeEvent.data);
              
              if (messageData.type === 'marker_click') {
                const place = messageData.place;
                console.log('RouteDetailScreen - Marker clicked:', place);
                
                // Doğrudan TourismSpotDetail'e yönlendir, araya başka ekran koyma
                navigation.navigate('TourismSpotDetail', { spot: place });
              }
            } catch (error) {
              console.error('RouteDetailScreen - Error parsing message:', error);
            }
          }}
        />
      </View>

      {/* Spots List */}
      <FlatList
        data={stops}
        renderItem={renderSpotItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="location-off" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Bu rotada gezi noktası bulunamadı</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  spotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#2E5266',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#2E5266',
  },
  spotImageContainer: {
    width: 100,
    height: 100,
  },
  spotImage: {
    width: '100%',
    height: '100%',
  },
  spotImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  spotName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
    flexShrink: 1,
  },
  spotAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  spotDescription: {
    fontSize: 13,
    color: '#546e7a',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  mapContainer: {
    height: height * 0.3,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#2E5266',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default RouteDetailScreen;
