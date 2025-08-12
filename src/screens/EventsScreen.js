import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../config/supabase';

const { width } = Dimensions.get('window');

const EventsScreen = ({ navigation }) => {
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEtkinlikler();
  }, []);

  const fetchEtkinlikler = async () => {
    try {
      setLoading(true);
      
      // İzmir Belediyesi API'sinden etkinlikleri çek
      const response = await fetch('https://openapi.izmir.bel.tr/api/ibb/kultursanat/etkinlikler');
      
      if (!response.ok) {
        throw new Error('API yanıt vermedi');
      }
      
      const apiData = await response.json();
      
      // API verilerini uygulama formatına dönüştür
      const transformedEvents = apiData.map((event, index) => ({
        id: event.Id || index + 1,
        ad: event.Adi || 'İsimsiz Etkinlik',
        aciklama: event.KisaAciklama || 'Açıklama bulunmuyor',
                 fotograf: event.Resim || event.KucukAfis || null,
         fotograf_yuksek_kalite: event.Resim || null, // Yüksek kaliteli resim için
        tarih: event.EtkinlikBaslamaTarihi || event.EtkinlikBitisTarihi || new Date().toISOString(),
        bitis_tarihi: event.EtkinlikBitisTarihi || null,
        baslama_saati: event.EtkinlikBaslamaTarihi ? new Date(event.EtkinlikBaslamaTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : null,
        bitis_saati: event.EtkinlikBitisTarihi ? new Date(event.EtkinlikBitisTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : null,
        tur: event.Tur || 'DİĞER',
        etkinlik_merkezi: event.EtkinlikMerkezi || 'Belirtilmemiş',
        ucretsiz_mi: event.UcretsizMi || false,
        bilet_linki: event.BiletSatisLinki || null,
        etkinlik_url: event.EtkinlikUrl || null,
        enlem: null, // API'de koordinat bilgisi yok
        boylam: null,
        telefon_numarasi: null,
        adres: event.EtkinlikMerkezi || 'Adres belirtilmemiş'
      }));
      
      setEtkinlikler(transformedEvents);
      
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
      setEtkinlikler(getDemoEvents());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDemoEvents = () => [
    {
      id: 1,
      ad: 'Tire Kültür Festivali',
      aciklama: 'Geleneksel el sanatları, müzik ve dans gösterileri ile dolu kültür festivali',
      fotograf: null,
      tarih: '2024-06-15',
      enlem: 38.0895,
      boylam: 27.7360,
      telefon_numarasi: '0232 511 11 11',
      bilet_linki: null,
      adres: 'Tire Merkez Meydan'
    },
    {
      id: 2,
      ad: 'Tire Lokum Şenliği',
      aciklama: 'Ünlü Tire lokumunun tanıtıldığı ve tadına bakıldığı şenlik',
      fotograf: null,
      tarih: '2024-07-20',
      enlem: 38.0892,
      boylam: 27.7355,
      telefon_numarasi: '0232 511 11 11',
      bilet_linki: null,
      adres: 'Tire Eski Belediye Meydanı'
    },
    {
      id: 3,
      ad: 'Tarihi Tire Turu',
      aciklama: 'Rehberli tarihi Tire turu ve müze ziyareti',
      fotograf: null,
      tarih: '2024-08-10',
      enlem: 38.0897,
      boylam: 27.7358,
      telefon_numarasi: '0232 511 11 11',
      bilet_linki: null,
      adres: 'Tire Müzesi'
    }
  ];

  const onRefresh = () => {
    setRefreshing(true);
    fetchEtkinlikler();
  };

  const onEventPress = (event) => {
    navigation.navigate('EventDetail', { event });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (tur) => {
    switch (tur?.toUpperCase()) {
      case 'KONSER':
        return '#FF5722';
      case 'SERGİ':
        return '#4CAF50';
      case 'TİYATRO':
        return '#9C27B0';
      case 'FESTİVAL':
        return '#FF9800';
      case 'DİĞER':
      default:
        return '#607D8B';
    }
  };

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => onEventPress(item)}
      activeOpacity={0.8}
    >
             <View style={styles.eventImageContainer}>
         {item.fotograf_yuksek_kalite || item.fotograf ? (
           <Image 
             source={{ 
               uri: item.fotograf_yuksek_kalite || item.fotograf,
               headers: {
                 'User-Agent': 'TireBelediyesi/1.0'
               }
             }} 
             style={styles.eventImage}
             resizeMode="cover"
             defaultSource={require('../../assets/etkinlik.png')}
             onError={(error) => {
               console.log('Resim yükleme hatası:', error);
               // Yüksek kaliteli resim yüklenemezse küçük resmi dene
               if (item.fotograf_yuksek_kalite && item.fotograf && item.fotograf_yuksek_kalite !== item.fotograf) {
                 // Küçük resmi yükle
               }
             }}
           />
         ) : (
           <Image 
             source={require('../../assets/etkinlik.png')} 
             style={styles.eventImage}
             resizeMode="cover"
           />
         )}
       </View>
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.ad}</Text>
          <View style={styles.dateContainer}>
            <Icon name="calendar-today" size={16} color="#2E5266" />
            <Text style={styles.eventDate}>{formatDate(item.tarih)}</Text>
          </View>
        </View>
        
        {item.baslama_saati && (
          <View style={styles.timeContainer}>
            <Icon name="access-time" size={14} color="#666" />
            <Text style={styles.eventTime}>{item.baslama_saati}</Text>
            {item.bitis_saati && (
              <Text style={styles.eventTime}> - {item.bitis_saati}</Text>
            )}
          </View>
        )}
        
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.aciklama}
        </Text>
        
        <View style={styles.eventFooter}>
          <View style={styles.footerLeft}>
            {item.adres && (
              <View style={styles.locationContainer}>
                <Icon name="location-on" size={14} color="#666" />
                <Text style={styles.locationText}>{item.adres}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.footerRight}>
            {item.tur && (
              <View style={[styles.eventTypeChip, { backgroundColor: getEventTypeColor(item.tur) }]}>
                <Text style={styles.eventTypeText}>{item.tur}</Text>
              </View>
            )}
            {item.ucretsiz_mi && (
              <View style={styles.freeChip}>
                <Text style={styles.freeChipText}>ÜCRETSİZ</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Events List */}
      <FlatList
        data={etkinlikler}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.eventsList}
        contentContainerStyle={styles.eventsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E5266',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
  },
  eventImageContainer: {
    width: '100%',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
    color: '#2E5266',
    fontWeight: '500',
    marginLeft: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventTypeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  freeChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  separator: {
    height: 12,
  },
});

export default EventsScreen;
