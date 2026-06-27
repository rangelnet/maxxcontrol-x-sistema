import { useState, useEffect } from 'react';
import api from '../../services/api';

const DEFAULT_BRANDING = {
  app_name: 'TV Maxx',
  logo_url: '',
  logo_dark_url: '',
  primary_color: '#FC5F16',
  secondary_color: '#FF6A00',
  background_color: '#050505',
  text_color: '#FFFFFF',
  accent_color: '#FF8C00',
  button_primary_color: '#FC5F16',
  button_focus_color: '#FFA500',
  button_text_color: '#FFFFFF',
  hero_banner_url: '',
  splash_screen_url: ''
};

export function useActiveBranding() {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get('/api/branding/current');
        if (data) {
          setBranding({ ...DEFAULT_BRANDING, ...data });
        }
      } catch (err) {
        console.error('Erro ao buscar branding ativo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, []);

  return { branding, loading };
}
