import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const HowToGetThereScreen = ({ navigation }) => {
  const address = "Cumhuriyet, 29 Ekim Caddesi No: 19, 35900 Tire/İzmir";
  
  const openInGoogleMaps = () => {
    const latitude = 38.08712743777985;
    const longitude = 27.731662796686482;
    
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
  const transportation = [
    {
      type: "Tren",
      icon: "train",
      description: "İzmir-Tire arası düzenli tren seferleri ile ulaşabilirsiniz",
      details: ["Günde 8 sefer", "Yaklaşık 1 saat süre", "Bilet ücreti: 15 TL"]
    },
    {
      type: "Otobüs",
      icon: "directions-bus",
      description: "Şehir merkezi otobüs hatları ile kolayca ulaşabilirsiniz",
      details: ["12, 23, 45 numaralı otobüsler", "Her 15 dakikada bir sefer", "Bilet ücreti: 3.50 TL"]
    },
    {
      type: "Özel Araç",
      icon: "directions-car",
      description: "Merkez konumunda otopark imkanı mevcuttur",
      details: ["Ücretsiz otopark", "200 araç kapasiteli", "7/24 güvenlik"]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nasıl Gelinir</Text>
                            <Text style={styles.headerSubtitle}>Tire Belediyesi merkez binasına ulaşım seçenekleri</Text>
      </View>

      {/* Address Box */}
      <View style={styles.addressBox}>
        <Text style={styles.addressTitle}>Adres</Text>
        <Text style={styles.addressText}>{address}</Text>
        <TouchableOpacity 
          style={styles.mapButton} 
          activeOpacity={0.7}
          onPress={openInGoogleMaps}
        >
          <Text style={styles.mapButtonText}>Haritada Göster</Text>
        </TouchableOpacity>
      </View>

      {/* Transportation Options */}
      <Text style={styles.sectionTitle}>Ulaşım Seçenekleri</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.transportationScroll}>
        {transportation.map((option, index) => (
          <View key={index} style={styles.transportationCard}>
            <Icon name={option.icon} size={48} color="#1976D2" />
            <Text style={styles.transportationType}>{option.type}</Text>
            <Text style={styles.transportationDescription}>{option.description}</Text>
            {option.details.map((detail, idx) => (
              <Text key={idx} style={styles.transportationDetail}>{detail}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
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
  addressBox: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  mapButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginLeft: 20,
    marginTop: 20,
  },
  transportationScroll: {
    paddingLeft: 20,
    paddingVertical: 16,
  },
  transportationCard: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginRight: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    minHeight: 220,
  },
  transportationType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginTop: 14,
  },
  transportationDescription: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
    lineHeight: 22,
  },
  transportationDetail: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    lineHeight: 18,
  },
});

export default HowToGetThereScreen; 