import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../config/supabase';

const TravelRoutesScreen = ({ navigation, route }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  useEffect(() => {
    fetchRoutes();
    
    // Eğer route parametrelerinden seçili rota ID'si geliyorsa
    if (route?.params?.selectedRouteId) {
      setSelectedRouteId(route.params.selectedRouteId);
    }
  }, [route?.params?.selectedRouteId]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      
      // Rotaları çek
      const { data: routesData, error: routesError } = await supabase
        .from('rotalar')
        .select('*')
        .order('id', { ascending: true });

      if (routesError) {
        console.error('Rotalar yüklenirken hata:', routesError);
        Alert.alert('Hata', 'Rotalar yüklenemedi');
        return;
      }

      console.log('Rotalar verisi:', routesData);

      // Her rota için gezi noktalarını çek
      const routesWithStops = await Promise.all(
        routesData.map(async (route) => {
          // Rota açıklamasını 50 kelimeye sınırla
          const description = route.aciklama 
            ? route.aciklama.split(' ').slice(0, 50).join(' ') + (route.aciklama.split(' ').length > 50 ? '...' : '')
            : 'Açıklama bulunamadı';

          let stopsData = [];
          
          // gezi_nok_id alanını parse et
          if (route.gezi_nok_id) {
            try {
              // Eğer string ise virgülle ayrılmış ID'leri parse et
              let geziNokIds = [];
              if (typeof route.gezi_nok_id === 'string') {
                geziNokIds = route.gezi_nok_id.split(',').map(id => id.trim()).filter(id => id);
              } else if (Array.isArray(route.gezi_nok_id)) {
                geziNokIds = route.gezi_nok_id;
              } else if (typeof route.gezi_nok_id === 'number') {
                geziNokIds = [route.gezi_nok_id.toString()];
              }

              console.log(`Rota ${route.id} için gezi nokta ID'leri:`, geziNokIds);

              if (geziNokIds.length > 0) {
                // İlk 3 gezi noktasını çek
                const { data: stops, error: stopsError } = await supabase
                  .from('gezi_noktalari')
                  .select('id, ad, aciklama, enlem, boylam')
                  .in('id', geziNokIds.slice(0, 3));

                if (stopsError) {
                  console.error('Gezi noktaları yüklenirken hata:', stopsError);
                } else {
                  stopsData = stops || [];
                  console.log(`Rota ${route.id} için gezi noktaları:`, stopsData);
                }
              }
            } catch (parseError) {
              console.error('gezi_nok_id parse hatası:', parseError);
            }
          }

          return {
            id: route.id,
            name: route.rota_adi || route.ad || route.name || 'Rota',
            description: description,
            stops: stopsData.map(stop => stop.ad),
            color: route.renk || route.color || '#1976D2',
            routeData: route,
            stopsData: stopsData
          };
        })
      );

      console.log('İşlenmiş rotalar:', routesWithStops);
      setRoutes(routesWithStops);
      
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderRouteCard = ({ item }) => (
    <View style={styles.routeCard}>
      <Text style={styles.routeName}>{item.name}</Text>
      <Text style={styles.routeDescription}>{item.description}</Text>
      <View style={styles.stopsContainer}>
        {item.stops.length > 0 ? (
          item.stops.slice(0, 3).map((stop, index) => (
            <Text 
              key={index} 
              style={[styles.stopChip, { maxWidth: 120 }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {stop.length > 12 ? stop.substring(0, 12) + '...' : stop}
            </Text>
          ))
        ) : (
          <Text style={styles.noStopsText}>Bu rotada henüz gezi noktası bulunmuyor</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => navigation.navigate('RouteDetail', {
            routeId: item.id,
            routeName: item.name
          })}
        >
          <Text style={styles.mapButtonText}>Rotayı Keşfet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gezi Rotaları</Text>
        <Text style={styles.headerSubtitle}>Şehrimizi keşfetmek için önerilen rotalar</Text>
      </View>

      {/* Tips Box */}
      <View style={styles.tipsBox}>
        <Icon name="lightbulb" size={24} color="#1976D2" />
        <Text style={styles.tipsText}>Rotaları takip ederken rahat ayakkabı giyin ve su şişenizi yanınıza alın.</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Rotalar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          renderItem={renderRouteCard}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.routesList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
  },
  routesList: {
    padding: 20,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stopsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stopChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#1976D2',
    marginRight: 8,
    marginBottom: 4,
    fontWeight: 'normal',
    flexShrink: 1,
    maxWidth: 120
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  guideButton: {
    borderColor: '#1976D2',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  guideButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noStopsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
});

export default TravelRoutesScreen; 