import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../config/supabase';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation, route }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const webViewRef = useRef(null);

  // Tire merkez koordinatları
  const initialRegion = {
    latitude: 38.0931,
    longitude: 27.7519,
    zoom: 13
  };

  const categories = [
    { id: 'all', name: 'Tümü', color: '#2E5266', icon: 'place' },
    { id: 'Tarihi', name: 'Tarihi', color: '#8B4513', icon: 'account-balance' },
    { id: 'Kültürel', name: 'Kültürel', color: '#9C2BCB', icon: 'palette' },
    { id: 'Yeme-İçme', name: 'Yeme-İçme', color: '#FF5722', icon: 'restaurant' },
    { id: 'Konaklama', name: 'Konaklama', color: '#1976D2', icon: 'hotel' },
  ];

  useEffect(() => {
    fetchPlaces();
    
    // Eğer route.params.spot varsa, o noktaya odaklan
    if (route.params?.spot) {
      console.log('MapScreen - Route params spot:', route.params.spot);
      const spot = route.params.spot;
      
      // Spot koordinatlarını kullanarak haritayı o noktaya odakla
      if (spot.enlem && spot.boylam) {
        const spotLat = parseFloat(spot.enlem);
        const spotLng = parseFloat(spot.boylam);
        
        // WebView'e spot koordinatlarını gönder
        if (webViewRef.current) {
          const focusScript = `
            if (window.map && window.spotMarker) {
              map.setView([${spotLat}, ${spotLng}], 16);
              spotMarker.openPopup();
            }
          `;
          webViewRef.current.injectJavaScript(focusScript);
        }
      }
    }
  }, [route.params?.spot]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('gezi_noktalari')
        .select('*');

      if (error) {
        console.error('Gezi noktaları alınırken hata:', error);
        Alert.alert('Hata', 'Harita verileri yüklenemedi');
        return;
      }

      console.log('MapScreen - Supabase\'den gelen veriler:', data);
      console.log('MapScreen - Veri sayısı:', data ? data.length : 0);
      
      if (data && data.length > 0) {
        console.log('MapScreen - Kategoriler:', [...new Set(data.map(item => item.kategori))]);
      }

      setPlaces(data || []);
    } catch (error) {
      console.error('Harita fetch hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPlaces = () => {
    console.log('MapScreen - Selected Category:', selectedCategory);
    console.log('MapScreen - All Places:', places);
    
    if (selectedCategory === 'all') {
      console.log('MapScreen - Returning all places:', places);
      return places;
    }
    
    // Kategori eşleştirme mantığı - farklı kategori isimlerini destekle
    const categoryMapping = {
      'tarihi': ['tarihi', 'tarihi yapı', 'tarihi yer', 'tarihi mekan'],
      'kültürel': ['kültürel', 'kültür', 'kültür merkezi', 'müze', 'sanat'],
      'yeme-içme': ['yeme-içme', 'restoran', 'cafe', 'lokanta', 'yemek'],
      'konaklama': ['konaklama', 'otel', 'hotel', 'pansiyon', 'misafirhane', 'butik otel']
    };
    
    const canonical = (v) => (v || '').toString().trim().toLowerCase();
    const selectedCategoryCanonical = canonical(selectedCategory);
    
    const filtered = places.filter(place => {
      const placeCategoryCanonical = canonical(place.kategori);
      
      // Direkt eşleşme kontrolü
      if (placeCategoryCanonical === selectedCategoryCanonical) {
        return true;
      }
      
      // Kategori mapping kontrolü
      const mappedCategories = categoryMapping[selectedCategoryCanonical];
      if (mappedCategories) {
        const matches = mappedCategories.some(mappedCat => 
          placeCategoryCanonical.includes(mappedCat) || mappedCat.includes(placeCategoryCanonical)
        );
        
        if (matches) {
          console.log('MapScreen - Category matched via mapping:', {
            place: place.ad,
            placeCategory: place.kategori,
            selectedCategory,
            matchedVia: 'mapping'
          });
          return true;
        }
      }
      
      console.log('MapScreen - Category mismatch:', {
        place: place.ad,
        placeCategory: place.kategori,
        placeCategoryCanonical,
        selectedCategory,
        selectedCategoryCanonical
      });
      
      return false;
    });
    
    console.log('MapScreen - Filtered places for category', selectedCategory, ':', filtered);
    
    return filtered;
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        {
          backgroundColor: selectedCategory === category.id ? category.color : 'white',
          borderColor: category.color,
        }
      ]}
      onPress={() => setSelectedCategory(category.id)}
      activeOpacity={0.8}
    >
      <Icon
        name={category.icon}
        size={16}
        color={selectedCategory === category.id ? 'white' : category.color}
      />
      <Text
        style={[
          styles.categoryButtonText,
          {
            color: selectedCategory === category.id ? 'white' : category.color,
          }
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  // OpenStreetMap HTML içeriği
  const generateMapHTML = () => {
    console.log('MapScreen - Generating HTML for category:', selectedCategory);
    
    const filteredPlaces = getFilteredPlaces();
    console.log('MapScreen - Filtered places:', filteredPlaces);
    
    // Sadece koordinatları olan yerleri filtrele - daha detaylı kontrol
    const placesWithCoordinates = filteredPlaces.filter(place => {
      const hasEnlem = place.enlem !== null && place.enlem !== undefined && place.enlem !== '';
      const hasBoylam = place.boylam !== null && place.boylam !== undefined && place.boylam !== '';
      const isValidEnlem = !isNaN(parseFloat(place.enlem)) && parseFloat(place.enlem) !== 0;
      const isValidBoylam = !isNaN(parseFloat(place.boylam)) && parseFloat(place.boylam) !== 0;
      
      const isValid = hasEnlem && hasBoylam && isValidEnlem && isValidBoylam;
      
      if (!isValid) {
        console.log('MapScreen - Invalid coordinates for place:', place.ad, {
          enlem: place.enlem,
          boylam: place.boylam,
          hasEnlem,
          hasBoylam,
          isValidEnlem,
          isValidBoylam,
          parsedEnlem: parseFloat(place.enlem),
          parsedBoylam: parseFloat(place.boylam)
        });
      } else {
        console.log('MapScreen - Valid coordinates for place:', place.ad, {
          enlem: parseFloat(place.enlem),
          boylam: parseFloat(place.boylam)
        });
      }
      
      return isValid;
    });
    
    console.log('MapScreen - Places with coordinates:', placesWithCoordinates);
    
    const markers = placesWithCoordinates.map(place => ({
      lat: parseFloat(place.enlem),
      lng: parseFloat(place.boylam),
      title: place.ad,
      description: place.aciklama,
      category: place.kategori
    }));

    // route.params.spot varsa onu da ekle
    let targetSpot = null;
    if (route.params?.spot) {
      const spot = route.params.spot;
      const hasSpotEnlem = spot.enlem !== null && spot.enlem !== undefined && spot.enlem !== '';
      const hasSpotBoylam = spot.boylam !== null && spot.boylam !== undefined && spot.boylam !== '';
      const isValidSpotEnlem = !isNaN(parseFloat(spot.enlem)) && parseFloat(spot.enlem) !== 0;
      const isValidSpotBoylam = !isNaN(parseFloat(spot.boylam)) && parseFloat(spot.boylam) !== 0;
      
      if (hasSpotEnlem && hasSpotBoylam && isValidSpotEnlem && isValidSpotBoylam) {
        targetSpot = {
          lat: parseFloat(spot.enlem),
          lng: parseFloat(spot.boylam),
          title: spot.ad,
          description: spot.aciklama,
          category: spot.kategori || 'belediye'
        };
        markers.push(targetSpot);
        console.log('MapScreen - Added target spot:', targetSpot);
      } else {
        console.log('MapScreen - Invalid target spot coordinates:', spot);
      }
    }

    // Harita merkezi ve zoom seviyesi
    let mapCenter = [initialRegion.latitude, initialRegion.longitude - 0.02]; // Daha sol tarafta açılması için longitude'u daha fazla azalt
    let mapZoom = 13; // Daha geniş alan göstermek için zoom seviyesini azalt
    
    // Eğer hedef nokta varsa, haritayı o noktaya odakla
    if (targetSpot) {
      mapCenter = [targetSpot.lat, targetSpot.lng];
      mapZoom = 16; // Daha yakın zoom
    }

    console.log('MapScreen - Map center:', mapCenter);
    console.log('MapScreen - Map zoom:', mapZoom);
    console.log('MapScreen - Markers count:', markers.length);

    // Marker verilerini JSON'a çevir ve HTML'e güvenli şekilde göm
    const markersJSON = JSON.stringify(markers);
    const markersHTML = `
      var markers = ${markersJSON};
      console.log('Markers to add:', markers);
      
      // Kategori renklerini belirle
      function getCategoryColor(category) {
        switch (category?.toLowerCase()) {
          case 'tarihi':
            return '#8B4513';
          case 'kültürel':
            return '#9C2BCB';
          case 'yeme-içme':
            return '#FF5722';
          case 'konaklama':
            return '#1976D2';
          default:
            return '#2E5266';
        }
      }
      
      if (markers && markers.length > 0) {
        markers.forEach(function(m, idx){
          try {
            var lat = parseFloat(m.lat);
            var lng = parseFloat(m.lng);
            
            if (isNaN(lat) || isNaN(lng)) {
              console.error('Invalid coordinates for marker:', m);
              return;
            }
            
            // Kategori rengini al
            var categoryColor = getCategoryColor(m.category);
            
            // Standart marker oluştur ama renkli
            var marker = L.marker([lat, lng]).addTo(map);
            
            // Marker'ın rengini değiştir
            marker.getElement().style.filter = 'hue-rotate(' + getHueRotation(categoryColor) + 'deg) saturate(1.5)';
            
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
            
            console.log('Added marker:', safeTitle, 'at', lat, lng, 'with color:', categoryColor);
          } catch (error) {
            console.error('Error adding marker:', error, m);
          }
        });
      } else {
        console.log('No markers to add');
      }
      
             // Renk kodunu hue rotation'a çevir
               function getHueRotation(color) {
           switch(color) {
              case '#8B4513': return 190; // Kahverengi (Tarihi)
              case '#9C2BCB': return 50; // Mor (Kültürel)
              case '#FF5722': return 268; // Turuncu (Yeme-İçme)
              case '#1976D2': return 240; // Mavi (Konaklama)
              default: return 0; // Varsayılan
           }
         }
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tire Haritası - ${selectedCategory}</title>
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
            console.log('Map loading for category: ${selectedCategory}');
            console.log('Markers count: ${markers.length}');
            
            // Harita oluştur
            var map = L.map('map').setView([${mapCenter[0]}, ${mapCenter[1]}], ${mapZoom});
            
            // Tile layer ekle
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(map);

            // Marker'ları ekle
            ${markersHTML}
            
            console.log('Map loaded with ${markers.length} markers for category: ${selectedCategory}');
            
            // Eğer marker yoksa bilgi mesajı göster
            if (${markers.length} === 0) {
              var infoDiv = document.createElement('div');
              infoDiv.className = 'error-message';
              infoDiv.innerHTML = '<h3>Bu kategoride haritada gösterilecek yer bulunamadı</h3><p>Farklı bir kategori seçmeyi deneyin veya koordinat bilgilerini kontrol edin.</p>';
              document.body.appendChild(infoDiv);
            }
            
          } catch (error) {
            console.error('Map error:', error);
            document.body.innerHTML = '<div class="error-message"><h2>Harita Yüklenemedi</h2><p>Lütfen internet bağlantınızı kontrol edin.</p><p>Hata: ' + error.message + '</p></div>';
          }
        </script>
      </body>
      </html>
    `;
    
    console.log('MapScreen - HTML generated successfully for category:', selectedCategory);
    return htmlContent;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E5266" />
        <Text style={styles.loadingText}>Harita yükleniyor...</Text>
      </View>
    );
  }

  // Veri yoksa bile haritayı göster; marker olmayabilir ama harita görünmeli

  return (
    <View style={styles.container}>
      {/* Kategori Filtreleri */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      {/* OpenStreetMap Haritası */}
      <WebView
        ref={webViewRef}
        key={selectedCategory} // Kategori değiştiğinde WebView'i yeniden oluştur
        source={{ html: generateMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadStart={() => {
          console.log('MapScreen - WebView loading started for category:', selectedCategory);
        }}
        onLoadEnd={() => {
          console.log('MapScreen - WebView loaded for category:', selectedCategory);
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('MapScreen - WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('MapScreen - WebView HTTP error:', nativeEvent);
        }}
        onMessage={(event) => {
          console.log('MapScreen - WebView message:', event.nativeEvent.data);
          
          try {
            const messageData = JSON.parse(event.nativeEvent.data);
            
            if (messageData.type === 'marker_click') {
              const place = messageData.place;
              console.log('MapScreen - Marker clicked:', place);
              
              // Map stack'inde TourismSpotDetail ekranına yönlendir
              navigation.navigate('TourismSpotDetail', { spot: place });
            }
          } catch (error) {
            console.error('MapScreen - Error parsing message:', error);
          }
        }}
      />
    </View>
  );
}

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
    marginTop: 16,
    fontSize: 16,
    color: '#2E5266',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
      categoryScroll: {
      flexDirection: 'row',
      gap: 7,
    },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 70,
    justifyContent: 'center',
  },
  categoryButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  map: {
    flex: 1,
  },
});


