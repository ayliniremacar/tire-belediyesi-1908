import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://sfulbvzijpvrkbqzadtl.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdWxidnppanB2cmticXphZHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTYyMjEsImV4cCI6MjA2OTI3MjIyMX0.IYe5Hul_KD05o_E9ufrI9d-PT9UBBcOgifqAFJjZ8tg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Database tables structure based on actual Supabase database
export const TABLES = {
  // Gezi noktaları tablosu - Turizm noktaları
  GEZI_NOKTALARI: 'gezi_noktalari',
  
  // Rotalar tablosu - Gezi rotaları
  ROTALAR: 'rotalar',
  
  // Influencerlar tablosu - Influencer bilgileri
  INFLUENCERLAR: 'influencerlar',
  
  // Etkinlikler tablosu - Etkinlikler
  ETKINLIKLER: 'etkinlikler'
};

// API endpoints for each table
export const API_ENDPOINTS = {
  // Gezi noktaları endpoints
  GEZI_NOKTALARI: {
    GET_ALL: '/rest/v1/gezi_noktalari',
    GET_BY_ID: (id) => `/rest/v1/gezi_noktalari?id=eq.${id}`,
    GET_BY_KATEGORI: (kategori) => `/rest/v1/gezi_noktalari?kategori=eq.${kategori}`,
    CREATE: '/rest/v1/gezi_noktalari',
    UPDATE: (id) => `/rest/v1/gezi_noktalari?id=eq.${id}`,
    DELETE: (id) => `/rest/v1/gezi_noktalari?id=eq.${id}`
  },
  
  // Rotalar endpoints
  ROTALAR: {
    GET_ALL: '/rest/v1/rotalar',
    GET_BY_ID: (id) => `/rest/v1/rotalar?id=eq.${id}`,
    GET_BY_KATEGORI: (kategori) => `/rest/v1/rotalar?kategori=eq.${kategori}`,
    GET_BY_GEZI_NOK_ID: (gezi_nok_id) => `/rest/v1/rotalar?gezi_nok_id=eq.${gezi_nok_id}`,
    CREATE: '/rest/v1/rotalar',
    UPDATE: (id) => `/rest/v1/rotalar?id=eq.${id}`,
    DELETE: (id) => `/rest/v1/rotalar?id=eq.${id}`
  },
  
  // Influencerlar endpoints
  INFLUENCERLAR: {
    GET_ALL: '/rest/v1/influencerlar',
    GET_BY_ID: (id) => `/rest/v1/influencerlar?id=eq.${id}`,
    GET_BY_ROTA_ID: (rota_id) => `/rest/v1/influencerlar?rota_id=eq.${rota_id}`,
    CREATE: '/rest/v1/influencerlar',
    UPDATE: (id) => `/rest/v1/influencerlar?id=eq.${id}`,
    DELETE: (id) => `/rest/v1/influencerlar?id=eq.${id}`
  },
  
  // Etkinlikler endpoints
  ETKINLIKLER: {
    GET_ALL: '/rest/v1/etkinlikler',
    GET_BY_ID: (id) => `/rest/v1/etkinlikler?id=eq.${id}`,
    GET_BY_TARIH: (tarih) => `/rest/v1/etkinlikler?tarih=eq.${tarih}`,
    CREATE: '/rest/v1/etkinlikler',
    UPDATE: (id) => `/rest/v1/etkinlikler?id=eq.${id}`,
    DELETE: (id) => `/rest/v1/etkinlikler?id=eq.${id}`
  }
};

// Table column mappings for easy reference
export const TABLE_COLUMNS = {
  // Gezi noktaları tablosu sütunları
  GEZI_NOKTALARI: {
    ID: 'id',
    AD: 'ad',
    ACIKLAMA: 'aciklama',
    KATEGORI: 'kategori',
    ENLEM: 'enlem',
    BOYLAM: 'boylam',
    FOTOGRAF: 'fotograf',
    ACILIS_SAATI: 'acilis_saati',
    KAPANIS_SAATI: 'kapanis_saati',
    TELEFON_NUMARASI: 'telefon_numarasi',
    ADRES: 'adres'
  },
  
  // Rotalar tablosu sütunları
  ROTALAR: {
    ID: 'id',
    ACIKLAMA: 'aciklama',
    GEZI_NOK_ID: 'gezi_nok_id',
    KATEGORI: 'kategori'
  },
  
  // Influencerlar tablosu sütunları
  INFLUENCERLAR: {
    ID: 'id',
    AD: 'ad',
    ACIKLAMA: 'aciklama',
    FOTOGRAF: 'fotograf',
    INSTAGRAM_LINKI: 'instagram_linki',
    ROTA_ID: 'rota_id'
  },
  
  // Etkinlikler tablosu sütunları
  ETKINLIKLER: {
    ID: 'id',
    AD: 'ad',
    ACIKLAMA: 'aciklama',
    FOTOGRAF: 'fotograf',
    TARIH: 'tarih',
    ENLEM: 'enlem',
    BOYLAM: 'boylam',
    TELEFON_NUMARASI: 'telefon_numarasi',
    BILET_LINKI: 'bilet_linki',
    ADRES: 'adres'
  }
}; 