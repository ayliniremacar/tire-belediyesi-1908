import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfulbvzijpvrkbqzadtl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdWxidnppanB2cmticXphZHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTYyMjEsImV4cCI6MjA2OTI3MjIyMX0.IYe5Hul_KD05o_E9ufrI9d-PT9UBBcOgifqAFJjZ8tg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllGeziNoktalari() {
  try {
    console.log('🔍 Supabase\'deki tüm gezi noktaları kontrol ediliyor...');
    
    const { data, error, count } = await supabase
      .from('gezi_noktalari')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Hata:', error);
      return;
    }

    console.log(`📊 Toplam kayıt sayısı: ${count}`);
    console.log('📋 Tüm kayıtlar:');
    console.log(JSON.stringify(data, null, 2));

    // Kategorilere göre gruplandır
    const categories = {};
    data.forEach(item => {
      if (!categories[item.kategori]) {
        categories[item.kategori] = [];
      }
      categories[item.kategori].push(item);
    });

    console.log('\n📂 Kategorilere göre dağılım:');
    Object.keys(categories).forEach(category => {
      console.log(`${category}: ${categories[category].length} kayıt`);
    });

  } catch (error) {
    console.error('❌ Beklenmeyen hata:', error);
  }
}

checkAllGeziNoktalari(); 