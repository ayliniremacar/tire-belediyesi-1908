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

const TourismScreen = ({ navigation }) => {
  const [geziNoktalari, setGeziNoktalari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tarihi');

  const categories = [
    { id: 'Tarihi', name: 'Tarihi', icon: 'account-balance', color: '#825522' },
    { id: 'Kültürel', name: 'Kültürel', icon: 'palette', color: '#FF6B35' },
    { id: 'Yeme-İçme', name: 'Yeme-İçme', icon: 'restaurant', color: '#4CAF50' },
    { id: 'Konaklama', name: 'Konaklama', icon: 'hotel', color: '#1976D2' },
  ];

  useEffect(() => {
    fetchGeziNoktalari();
  }, []);

  const fetchGeziNoktalari = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gezi_noktalari')
        .select('*')
        .order('ad', { ascending: true });

      if (error) {
        console.error('Gezi noktaları yüklenirken hata:', error);
        setGeziNoktalari(getDemoData());
      } else {
        setGeziNoktalari(data || getDemoData());
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      setGeziNoktalari(getDemoData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  

  const onRefresh = () => {
    setRefreshing(true);
    fetchGeziNoktalari();
  };

  const filteredGeziNoktalari = geziNoktalari.filter(nokta => {
    const canonical = (v) => (v || '').toString().trim().toLowerCase();
    const selectedCategoryCanonical = canonical(selectedCategory);
    const placeCategoryCanonical = canonical(nokta.kategori);
    
    // Direkt eşleşme kontrolü
    if (placeCategoryCanonical === selectedCategoryCanonical) {
      return true;
    }
    
    // Kategori mapping kontrolü
    const categoryMapping = {
      'tarihi': ['tarihi', 'tarihi yapı', 'tarihi yer', 'tarihi mekan'],
      'kültürel': ['kültürel', 'kültür', 'kültür merkezi', 'müze', 'sanat'],
      'yeme-içme': ['yeme-içme', 'restoran', 'cafe', 'lokanta', 'yemek'],
      'konaklama': ['konaklama', 'otel', 'hotel', 'pansiyon', 'misafirhane', 'butik otel']
    };
    
    const mappedCategories = categoryMapping[selectedCategoryCanonical];
    if (mappedCategories) {
      return mappedCategories.some(mappedCat => 
        placeCategoryCanonical.includes(mappedCat) || mappedCat.includes(placeCategoryCanonical)
      );
    }
    
    return false;
  });

  const onSpotPress = (spot) => {
    navigation.navigate('TourismSpotDetail', { spot });
  };

  const getCategoryColor = (kategori) => {
    const category = categories.find(cat => cat.id === kategori);
    return category ? category.color : '#2E5266';
  };

  const renderSpotCard = ({ item }) => (
    <TouchableOpacity
      style={styles.spotCard}
      onPress={() => onSpotPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.spotHeader}>
          <Text style={styles.spotTitle}>{item.ad}</Text>
          <View style={[styles.categoryChip, { backgroundColor: getCategoryColor(item.kategori) }]}>
            <Text style={styles.categoryChipText}>{item.kategori}</Text>
          </View>
        </View>
        
        <Text style={styles.spotDescription} numberOfLines={2}>
          {item.aciklama}
        </Text>
        
        {item.adres && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.locationText}>{item.adres}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={24} color="#2E5266" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.activeTab
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon 
                name={category.icon} 
                size={18} 
                color={selectedCategory === category.id ? '#1976D2' : '#666'} 
              />
              <Text 
                style={[
                  styles.categoryTabText,
                  selectedCategory === category.id && styles.activeTabText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Spots List */}
      <FlatList
        data={filteredGeziNoktalari}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.spotsList}
        contentContainerStyle={styles.spotsListContent}
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
  categoryTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 80,
    flexShrink: 0,
  },
  activeTab: {
    borderBottomColor: '#1976D2',
  },
  categoryTabText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  spotsList: {
    flex: 1,
  },
  spotsListContent: {
    padding: 16,
  },
  spotCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E5266',
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
  },
  spotDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
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
  arrowContainer: {
    marginLeft: 12,
    padding: 4,
  },
  separator: {
    height: 12,
  },
  categoryTabsScrollContent: {
    alignItems: 'center',
  },
});

export default TourismScreen;