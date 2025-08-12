import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ContactScreen = ({ navigation }) => {
  const contactInfo = {
    phone: "+90 444 35 03",
    email: "tirebel@tire.bel.tr",
    address: "29 EKİM CAD. CUMHURİYET MAH. NO:19 35900 İZMİR/TİRE",
    whatsapp: "+90 444 35 03"
  };



  const makePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openWhatsApp = (phoneNumber) => {
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  const openMaps = () => {
    const address = contactInfo.address;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bize Ulaşın</Text>
        <Text style={styles.headerSubtitle}>Sorularınız ve önerileriniz için bizimle iletişime geçin</Text>
      </View>

      {/* Contact Cards */}
      <View style={styles.contactCardsSection}>
        {/* Phone Card */}
        <TouchableOpacity 
          style={styles.contactCard}
          onPress={() => makePhoneCall(contactInfo.phone)}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="phone" size={24} color="#1976D2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Telefon</Text>
            <Text style={styles.cardValue}>{contactInfo.phone}</Text>
            <Text style={styles.cardDescription}>Mesai saatleri içinde arayabilirsiniz</Text>
          </View>
        </TouchableOpacity>

        {/* Email Card */}
        <TouchableOpacity 
          style={styles.contactCard}
          onPress={() => sendEmail(contactInfo.email)}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="email" size={24} color="#1976D2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>E-posta</Text>
            <Text style={styles.cardValue}>{contactInfo.email}</Text>
            <Text style={styles.cardDescription}>Sorularınızı e-posta ile iletebilirsiniz</Text>
          </View>
        </TouchableOpacity>

        {/* Address Card */}
        <TouchableOpacity 
          style={styles.contactCard}
          onPress={() => navigation.navigate('Map', {
            spot: {
              ad: 'Tire Belediyesi',
              aciklama: 'Tire Belediyesi merkez binası',
              enlem: 38.0931,
              boylam: 27.7519,
              kategori: 'belediye'
            }
          })}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="place" size={24} color="#1976D2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Adres</Text>
            <Text style={styles.cardValue}>{contactInfo.address}</Text>
            <Text style={styles.cardDescription}>Merkez binayı ziyaret edebilirsiniz</Text>
          </View>
        </TouchableOpacity>

        {/* WhatsApp Card */}
        <TouchableOpacity 
          style={styles.contactCard}
          onPress={() => openWhatsApp(contactInfo.whatsapp)}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="chat" size={24} color="#1976D2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>WhatsApp</Text>
            <Text style={styles.cardValue}>{contactInfo.whatsapp}</Text>
            <Text style={styles.cardDescription}>7/24 WhatsApp destek hattı</Text>
          </View>
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
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  contactCardsSection: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
  },

});

export default ContactScreen; 