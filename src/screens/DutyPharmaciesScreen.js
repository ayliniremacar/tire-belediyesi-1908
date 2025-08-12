import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DutyPharmaciesScreen = ({ navigation }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDutyPharmacies();
    
    // Her gün saat 09:00'da güncelle
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        console.log('DutyPharmaciesScreen - Saat 09:00, nöbetçi eczaneler güncelleniyor...');
        fetchDutyPharmacies();
      }
    }, 60000); // Her dakika kontrol et
    
    return () => clearInterval(interval);
  }, []);

  const fetchDutyPharmacies = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler');
      const data = await response.json();
      
      // Tire bölgesindeki eczaneleri filtrele
      const tirePharmacies = data.filter(pharmacy => {
        return pharmacy.Bolge === "TİRE" || 
               pharmacy.Bolge.toUpperCase().includes("TİRE") ||
               pharmacy.Bolge.toUpperCase().includes("TIRE");
      });
      
      console.log('Tire bölgesindeki eczaneler:', tirePharmacies);
      setPharmacies(tirePharmacies);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Eczane verileri alınırken hata:', error);
      Alert.alert('Hata', 'Nöbetçi eczane verileri yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchDutyPharmacies(true);
  };

  const formatLastUpdated = (date) => {
    if (!date) return 'Henüz güncellenmedi';
    
    const formattedDate = date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${formattedDate} ${formattedTime} tarihinde güncellendi`;
  };

  const callPharmacy = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Hata', 'Telefon numarası bulunamadı');
    }
  };

  const openInGoogleMaps = (latitude, longitude, name) => {
    // Direkt rota başlamasını engellemek için dir_action=navigate parametresini kaldırdım
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Google Maps yoksa web tarayıcısında aç
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(webUrl);
      }
    }).catch(err => {
      console.error('Google Maps açılırken hata:', err);
      Alert.alert('Hata', 'Google Maps açılamadı');
    });
  };

  const renderDutyPharmacy = () => {
    if (pharmacies.length === 0) {
      return (
        <View style={styles.dutyPharmacyCard}>
          <View style={styles.dutyPharmacyHeader}>
            <Text style={styles.dutyPharmacyTitle}>Nöbetçi Eczane (Bugün)</Text>
          </View>
          <Text style={styles.pharmacyName}>Tire'de nöbetçi eczane bulunamadı</Text>
          <Text style={styles.pharmacyAddress}>Lütfen daha sonra tekrar deneyin</Text>
        </View>
      );
    }

    const firstPharmacy = pharmacies[0];
    return (
      <View style={styles.dutyPharmacyCard}>
        <View style={styles.dutyPharmacyHeader}>
          <Text style={styles.dutyPharmacyTitle}>Nöbetçi Eczane (Bugün)</Text>
        </View>
        <Text style={styles.pharmacyName}>{firstPharmacy.Adi}</Text>
        <Text style={styles.pharmacyAddress}>{firstPharmacy.Adres}</Text>
        <View style={styles.dutyPharmacyButtons}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => callPharmacy(firstPharmacy.Telefon)}
          >
            <Text style={styles.callButtonText}>Ara</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={() => openInGoogleMaps(
              parseFloat(firstPharmacy.LokasyonX),
              parseFloat(firstPharmacy.LokasyonY),
              firstPharmacy.Adi
            )}
          >
            <Text style={styles.directionsButtonText}>Yol Tarifi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPharmacyCard = ({ item }) => (
    <View style={styles.pharmacyCard}>
      <View style={styles.pharmacyHeader}>
        <Text style={styles.pharmacyName}>{item.Adi}</Text>
        <View style={[styles.statusChip, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.statusChipText}>Açık</Text>
        </View>
      </View>
      <Text style={styles.pharmacyAddress}>{item.Adres}</Text>
      {item.BolgeAciklama && (
        <Text style={styles.pharmacyHours}>{item.BolgeAciklama}</Text>
      )}
             <View style={styles.pharmacyButtons}>
         <TouchableOpacity 
           style={styles.callButton}
           onPress={() => callPharmacy(item.Telefon)}
         >
          <Text style={styles.callButtonText}>Ara</Text>
        </TouchableOpacity>
                 <TouchableOpacity 
           style={styles.directionsButton}
           onPress={() => openInGoogleMaps(
             parseFloat(item.LokasyonX),
             parseFloat(item.LokasyonY),
             item.Adi
           )}
         >
          <Text style={styles.directionsButtonText}>Yol Tarifi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E5266" />
          <Text style={styles.loadingText}>Nöbetçi eczaneler yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.lastUpdatedContainer}>
          <Icon name="update" size={16} color="#666" />
          <Text style={styles.lastUpdatedText}>
            {formatLastUpdated(lastUpdated)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Icon 
            name="refresh" 
            size={20} 
            color={refreshing ? "#999" : "#2E5266"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={pharmacies.slice(1)} // İlk eczane duty pharmacy olarak gösterildi
        renderItem={renderPharmacyCard}
        keyExtractor={(item) => item.EczaneId.toString()}
        ListHeaderComponent={renderDutyPharmacy}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E5266']}
            tintColor="#2E5266"
          />
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
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
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
  listContainer: {
    padding: 16,
  },
  dutyPharmacyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dutyPharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dutyPharmacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
  },
  acilChip: {
    backgroundColor: '#f44336',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  acilChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  pharmacyHours: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  open24h: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#1976D2',
    marginRight: 8,
    marginBottom: 8,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pharmacyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dutyPharmacyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  pharmacyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  directionsButton: {
    borderColor: '#9E9E9E',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DutyPharmaciesScreen;