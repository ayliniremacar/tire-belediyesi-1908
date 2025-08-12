import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getWeatherUrl } from '../config/weather';

const HomeScreen = ({ navigation }) => {
  const municipality = "Tire Belediyesi'";
  const appVersion = "1.0.15"; // Sürüm bilgisi
  const [weather, setWeather] = useState({
    location: "Tire",
    temperature: null,
    status: "Hava durumu yükleniyor...",
    humidity: null,
    windSpeed: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q=Tire,tr&appid=0bbf76040ca295b36ed45c2d66937050&units=metric&lang=tr");
      const data = await response.json();
      
      console.log('Hava durumu verisi:', data); // Debug için
      
      if (data.cod === 200) {
        // Hava durumuna göre açık/kapalı durumunu belirle
        const weatherStatus = data.weather[0].main.toLowerCase();
        const weatherDescription = data.weather[0].description.toLowerCase();
        
        // Açık hava durumları
        const clearConditions = [
          'clear', 'sunny', 'açık', 'güneşli', 'parçalı bulutlu', 'az bulutlu'
        ];
        
        // Kapalı hava durumları
        const cloudyConditions = [
          'clouds', 'cloudy', 'overcast', 'kapalı', 'bulutlu', 'yağmurlu', 'kar', 'sis', 'duman'
        ];
        
        let isClear = false;
        
        // Açık durumları kontrol et
        if (clearConditions.some(condition => 
          weatherStatus.includes(condition) || weatherDescription.includes(condition)
        )) {
          isClear = true;
        }
        
        // Kapalı durumları kontrol et
        if (cloudyConditions.some(condition => 
          weatherStatus.includes(condition) || weatherDescription.includes(condition)
        )) {
          isClear = false;
        }
        
        const weatherDisplay = isClear ? 'Açık' : 'Kapalı';
        
        setWeather({
          location: "Tire",
          temperature: Math.round(data.main.temp),
          status: weatherDisplay,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6) // m/s'den km/h'ye çevir
        });
      } else {
        console.log('API hatası:', data);
        setWeather({
          location: "Tire",
          temperature: null,
          status: "Hava durumu alınamadı",
          humidity: null,
          windSpeed: null
        });
      }
    } catch (error) {
      console.error('Hava durumu hatası:', error);
      setWeather({
        location: "Tire",
        temperature: null,
        status: "Hava durumu alınamadı",
        humidity: null,
        windSpeed: null
      });
    } finally {
      setLoading(false);
    }
  };
  const shortcuts = [
    { title: "Nasıl Gelinir", icon: 'directions', color: '#4CAF50', onPress: () => navigation.navigate('HowToGetThere') },
    { title: "Başkanın Mesajı", icon: 'person', color: '#2196F3', onPress: () => navigation.navigate('MayorMessage') },
    { title: "Gezi Rotaları", icon: 'route', color: '#FF9800', onPress: () => navigation.navigate('TravelRoutes') },
    { title: "Influencer Rotaları", icon: 'star', color: '#E91E63', onPress: () => navigation.navigate('InfluencerRoutes') },
    { title: "Bize Ulaşın", icon: 'contact-phone', color: '#9C27B0', onPress: () => navigation.navigate('Contact') },
    { title: "Nöbetçi Eczaneler", icon: 'local-pharmacy', color: '#F44336', onPress: () => navigation.navigate('DutyPharmacies') },
    { title: "Acil Durum", icon: 'warning', color: '#FF5722', onPress: () => navigation.navigate('Emergency') }
  ];
  const about = {
    title: "Tarihçemiz",
    description: "Şehrimiz, binlerce yıllık köklü bir geçmişe sahiptir. Antik çağlardan günümüze kadar birçok medeniyete ev sahipliği yapmıştır."
  };

  return (
    <ScrollView style={styles.container}>
      {/* Karşılama Alanı */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logoyeni.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.headerText}>{municipality}ne{"\n"}Hoşgeldiniz</Text>
      </View>

             {/* Hava Durumu */}
       <View style={styles.weatherCard}>
        <View style={styles.weatherMain}>
          <Text style={styles.weatherLocation}>Şehir Merkezi</Text>
          <Text style={styles.weatherDegree}>
            {loading ? '...' : (weather.temperature ? `${weather.temperature}°C` : '--°C')}
          </Text>
          <Text style={styles.weatherStatus}>
            {loading ? 'Yükleniyor...' : weather.status}
          </Text>
        </View>
      </View>

      {/* Hızlı Erişim */}
      <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAccess}>
        {shortcuts.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.quickCard, { backgroundColor: item.color }]} onPress={item.onPress}>
            <Icon name={item.icon} size={32} color="white" />
            <Text style={styles.quickText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tanıtım Görseli - Tire */}
      <Image 
        source={require('../../assets/tire.jpg')} 
        style={styles.promoImage} 
        resizeMode="cover"
        onError={(error) => console.log('Image loading error:', error)}
        onLoad={() => console.log('Image loaded successfully')}
      />

      {/* Tarihçemiz */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>{about.title}</Text>
        <Text style={styles.aboutText}>
          {about.description}
        </Text>
      </View>
      
      {/* Sürüm Bilgisi */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Sürüm: {appVersion}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2E5266', 
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  logoContainer: {
    width: 48,
    height: 48,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent'
  },
  logo: { 
    width: '100%', 
    height: '100%',
    backgroundColor: 'transparent'
  },
  headerText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold',
    lineHeight: 24
  },
  weatherCard: { 
    backgroundColor: 'white', 
    margin: 16, 
    borderRadius: 10, 
    padding: 16, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  weatherTitle: { 
    fontSize: 18, 
    color: '#666',
    marginLeft: 4,
    fontWeight: '500'
  },
  weatherMain: {
    marginBottom: 12
  },
  weatherLocation: { 
    fontSize: 18, 
    color: '#666',
    marginBottom: 4,
    textAlign: 'left'
  },
  weatherDegree: { 
    fontSize: 32, 
    fontWeight: 'bold',
    color: '#2E5266',
    marginBottom: 4
  },
  weatherStatus: { 
    fontSize: 14, 
    color: '#666',
    fontWeight: 'normal',
    marginTop: 4
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2E5266',
    marginHorizontal: 16, 
    marginTop: 20,
    marginBottom: 12
  },
  quickAccess: { 
    paddingLeft: 16, 
    marginVertical: 12 
  },
  quickCard: { 
    alignItems: 'center', 
    padding: 16, 
    marginRight: 12, 
    borderRadius: 12, 
    width: 110, 
    height: 100,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6
  },
  quickText: { 
    fontSize: 12, 
    textAlign: 'center', 
    color: 'white', 
    fontWeight: 'bold', 
    marginTop: 8,
    lineHeight: 16
  },
  promoImage: { 
    width: '92%', 
    height: 200, 
    borderRadius: 12, 
    alignSelf: 'center', 
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  aboutSection: { 
    paddingHorizontal: 16, 
    paddingBottom: 24,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  aboutText: { 
    fontSize: 15, 
    color: '#555', 
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 16
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20
  },
  versionText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500'
  },
});

export default HomeScreen;