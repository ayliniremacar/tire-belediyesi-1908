import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const TourismSpotDetailScreen = ({ route, navigation }) => {
  const { spot } = route.params;

  const openPhone = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const openMaps = () => {
    if (spot.enlem && spot.boylam) {
      const latitude = parseFloat(spot.enlem);
      const longitude = parseFloat(spot.boylam);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        Alert.alert('Hata', 'Geçerli konum bilgisi bulunamadı');
        return;
      }
      
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
    } else {
      Alert.alert('Hata', 'Bu konum için yol tarifi mevcut değil');
    }
  };

  const getCategoryColor = (kategori) => {
    switch (kategori?.toLowerCase()) {
      case 'tarihi':
        return '#825522';
      case 'kültürel':
        return '#FF6B35';
      case 'yeme-içme':
        return '#4CAF50';
      case 'konaklama':
        return '#1976D2';
      default:
        return '#2E5266';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        {spot.fotograf ? (
          <Image 
            source={{ uri: spot.fotograf }} 
            style={styles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="place" size={80} color="#ccc" />
            <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Category */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{spot.ad}</Text>
          <View style={[styles.categoryChip, { backgroundColor: getCategoryColor(spot.kategori) }]}>
            <Text style={styles.categoryChipText}>{spot.kategori}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>{spot.aciklama}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Address Info */}
          {spot.adres && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="location-on" size={20} color="#1976D2" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adres</Text>
                <Text style={styles.infoValue}>{spot.adres}</Text>
              </View>
            </View>
          )}

          {/* Phone Info */}
          {spot.telefon_numarasi && (
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openPhone(spot.telefon_numarasi)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name="phone" size={20} color="#1976D2" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={[styles.infoValue, styles.phoneValue]}>
                  {spot.telefon_numarasi}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Opening Hours */}
          {spot.acilis_saati && spot.kapanis_saati && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon name="access-time" size={20} color="#1976D2" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Açılış Saatleri</Text>
                <Text style={styles.infoValue}>
                  {spot.acilis_saati} - {spot.kapanis_saati}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={openMaps}
            activeOpacity={0.8}
          >
            <Icon name="directions" size={22} color="white" />
            <Text style={styles.primaryButtonText}>Yol Tarifi</Text>
          </TouchableOpacity>

          {spot.telefon_numarasi && (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => openPhone(spot.telefon_numarasi)}
              activeOpacity={0.8}
            >
              <Icon name="phone" size={22} color="#1976D2" />
              <Text style={styles.secondaryButtonText}>Ara</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    width: '100%',
    height: 280,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 12,
    lineHeight: 32,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#555',
    textAlign: 'left',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  phoneValue: {
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1976D2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TourismSpotDetailScreen;