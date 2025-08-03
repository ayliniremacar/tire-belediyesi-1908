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
      const { data, error } = await supabase
        .from('etkinlikler')
        .select('*')
        .order('tarih', { ascending: true });

      if (error) {
        console.error('Etkinlikler yüklenirken hata:', error);
        setEtkinlikler(getDemoEvents());
      } else {
        setEtkinlikler(data || getDemoEvents());
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
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

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => onEventPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.eventImageContainer}>
        {item.fotograf ? (
          <Image 
            source={{ uri: item.fotograf }} 
            style={styles.eventImage}
            resizeMode="cover"
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
        
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.aciklama}
        </Text>
        
        <View style={styles.eventFooter}>
          {item.adres && (
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.locationText}>{item.adres}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Etkinlikler</Text>
      </View>

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
    height: 180,
  },
  eventImage: {
    width: '100%',
    height: '100%',
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
  separator: {
    height: 12,
  },
});

export default EventsScreen;
