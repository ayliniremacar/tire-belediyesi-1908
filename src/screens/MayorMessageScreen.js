import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';

const MayorMessageScreen = () => {
  const data = {
    name: "Hayati Okuroğlu",
    title: "Tire Belediye Başkanı",
    photo: require('../../assets/baskan.jpg'),
    message: "Sevgili Tire Belediyesi sakinleri, bu modern mobil uygulamamız ile...",
    phone: "444 35 03",
    email: "tirebel@tire.bel.tr"
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${data.email}`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${data.phone}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Mayor Info */}
      <View style={styles.mayorInfoContainer}>
        <Image 
          source={data.photo} 
          style={styles.avatar}
          onError={(error) => console.log('Başkan resmi yükleme hatası:', error)}
          onLoad={() => console.log('Başkan resmi başarıyla yüklendi')}
          resizeMode="cover"
        />
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.title}>{data.title}</Text>
      </View>

      {/* Message Card */}
      <View style={styles.messageCard}>
        <Text style={styles.cardTitle}>Değerli Hemşehrilerim</Text>
        <Text style={styles.messageText}>{data.message}</Text>
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>İletişim</Text>
        <TouchableOpacity onPress={openPhone} style={styles.contactItem}>
          <Text style={styles.contactText}>Telefon: {data.phone}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openEmail} style={styles.contactItem}>
          <Text style={styles.contactText}>E-posta: {data.email}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mayorInfoContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E5266',
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  messageCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  contactSection: {
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
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 12,
  },
  contactItem: {
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#1976D2',
  },
});

export default MayorMessageScreen;