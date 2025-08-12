import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../config/supabase';

const InfluencerRoutesScreen = ({ navigation }) => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const handleRouteExplore = (routeId, routeName) => {
    // Direkt olarak rota detay sayfasına yönlendir
    navigation.navigate('RouteDetail', { 
      routeId: routeId,
      routeName: routeName 
    });
  };

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      
      // Influencerları çek
      const { data: influencersData, error: influencersError } = await supabase
        .from('influencerlar')
        .select('*');

      if (influencersError) {
        console.error('Influencerlar alınırken hata:', influencersError);
        Alert.alert('Hata', 'Influencer verileri yüklenemedi');
        return;
      }

      // Her influencer için rota ve gezi noktaları bilgilerini çek
      const influencersWithDetails = await Promise.all(
        influencersData.map(async (influencer) => {
          let routeDetails = null;
          let routeStops = [];
          let routeTips = [];

          // Influencer'ın bağlı olduğu rotayı çek
          if (influencer.rota_id) {
            const { data: routeData, error: routeError } = await supabase
              .from('rotalar')
              .select('*')
              .eq('id', influencer.rota_id)
              .single();

            if (!routeError && routeData) {
              routeDetails = routeData;
              
              // Rotaya bağlı gezi noktalarını çek
              if (routeData.gezi_nok_id) {
                let geziNokIds = [];
                
                // gezi_nok_id'yi parse et
                if (typeof routeData.gezi_nok_id === 'string') {
                  geziNokIds = routeData.gezi_nok_id.split(',').map(id => id.trim()).filter(id => id);
                } else if (Array.isArray(routeData.gezi_nok_id)) {
                  geziNokIds = routeData.gezi_nok_id;
                } else if (typeof routeData.gezi_nok_id === 'number') {
                  geziNokIds = [routeData.gezi_nok_id.toString()];
                }

                if (geziNokIds.length > 0) {
                  const { data: stopsData, error: stopsError } = await supabase
                    .from('gezi_noktalari')
                    .select('id, ad, aciklama')
                    .in('id', geziNokIds);

                  if (!stopsError && stopsData) {
                    routeStops = stopsData;
                  }
                }
              }

              // Rotaya bağlı tavsiyeleri çek
              const { data: tipsData, error: tipsError } = await supabase
                .from('tavsiyeler')
                .select('*')
                .eq('rota_id', influencer.rota_id);

              if (!tipsError && tipsData) {
                routeTips = tipsData;
              }
            }
          }

          return {
            ...influencer,
            routeDetails,
            routeStops,
            routeTips
          };
        })
      );

      setInfluencers(influencersWithDetails || []);
    } catch (error) {
      console.error('Influencer fetch hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Influencer rotaları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Influencer Rotaları</Text>
        <Text style={styles.headerSubtitle}>Popüler içerik üreticilerinin önerdiği rotalar</Text>
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Icon name="star" size={24} color="#9C27B0" />
        <Text style={styles.tipsText}>Her influencer'ın kendi deneyimlerine dayalı özel tavsiyeleri var...</Text>
      </View>

      {/* Influencer Cards */}
      {influencers.map((influencer, index) => (
        <View key={influencer.id || index} style={styles.routeCard}>
          {/* Influencer Info */}
          <View style={styles.influencerInfo}>
            <Image
              source={influencer.fotograf ? { uri: influencer.fotograf } : require('../../assets/logo.png')}
              style={styles.influencerImage}
            />
            <View style={styles.influencerDetails}>
              <Text style={styles.influencerName}>{influencer.ad || 'Bilinmeyen Influencer'}</Text>
              <Text style={styles.influencerDescription}>{influencer.aciklama || 'Açıklama bulunamadı'}</Text>
            </View>
          </View>

          {/* Route Details */}
          {influencer.routeDetails && (
            <>
              <Text style={styles.routeTitle}>{influencer.routeDetails.rota_adi || influencer.routeDetails.ad || influencer.routeDetails.name || 'Rota Adı Bulunamadı'}</Text>
              <Text style={styles.routeDescription}>{influencer.routeDetails.aciklama || 'Açıklama bulunamadı'}</Text>
              
              {/* Route Stops */}
              <View style={styles.highlightsSection}>
                <Text style={styles.sectionTitle}>Rotadaki Duraklar</Text>
                {influencer.routeStops.length > 0 ? (
                  influencer.routeStops.map((stop, stopIndex) => (
                    <View key={stop.id || stopIndex} style={styles.highlightItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.highlightText}>{stop.ad || stop.name || 'Bilinmeyen Durak'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>Bu rotaya ait durak bulunamadı</Text>
                )}
              </View>

              {/* Tips */}
              <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>Tavsiyeler</Text>
                {influencer.routeTips.length > 0 ? (
                  influencer.routeTips.map((tip, tipIndex) => (
                    <View key={tip.id || tipIndex} style={styles.tipBox}>
                      <Text style={styles.tipText}>{tip.tavsiye || tip.aciklama || tip.ad || tip.content || tip.text || 'Tavsiye bulunamadı'}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>Bu rota için henüz tavsiye bulunmuyor</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Start Route Button */}
          <TouchableOpacity 
            style={styles.startRouteButton}
            onPress={() => handleRouteExplore(
              influencer.routeDetails?.id, 
              influencer.routeDetails?.rota_adi || influencer.routeDetails?.ad || influencer.routeDetails?.name || 'Rota'
            )}
          >
            <Text style={styles.startRouteButtonText}>Rotayı Keşfet</Text>
          </TouchableOpacity>
        </View>
      ))}

      {influencers.length === 0 && !loading && (
        <View style={styles.noDataContainer}>
          <Icon name="info" size={48} color="#ccc" />
          <Text style={styles.noDataText}>Henüz influencer rotası bulunmuyor</Text>
        </View>
      )}
    </ScrollView>
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
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 20,
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#9C27B0',
    marginLeft: 8,
  },
  routeCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  highlightsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipBox: {
    backgroundColor: '#f3e5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#9C27B0',
  },
  startRouteButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startRouteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  influencerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  influencerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  influencerDetails: {
    flex: 1,
  },
  influencerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 4,
  },
  influencerDescription: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default InfluencerRoutesScreen; 