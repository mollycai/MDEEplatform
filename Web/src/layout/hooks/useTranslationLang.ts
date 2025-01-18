import { useI18n } from 'vue-i18n';
import { useGlobalConfig } from '@/config';
import { onBeforeMount } from 'vue';

export function useTranslationLang() {
  const { locale, t } = useI18n();
  const { getConfig, setConfig } = useGlobalConfig();
  function translationCh() {
    setConfig({ Locale: 'zh' });
    locale.value = 'zh';
  }
  function translationEn() {
    setConfig({ Locale: 'en' });
    locale.value = 'en';
  }
  onBeforeMount(() => {
    locale.value = getConfig().Locale ?? 'zh';
  });
  return {
    t,
    locale,
    translationCh,
    translationEn,
  };
}
