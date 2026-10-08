export interface BrandConfig {
  id: 'marasy' | 'vettro' | 'custom';
  appName: string;
  appSubtitle: string;
  companyName: string;
  securityDepartmentName: string;
  logoText: string;
  logoSubtitle: string;
  logoBadge: string;
  logoPath?: string;
  aiAssistantName: string;
  aiAssistantRole: string;
  aiWelcomeMessage: string;
  whatsappSignature: string;
  copyrightText: string;
  supportContact: string;
  defaultSecurityCompanies: string[];
}

export const BRAND_PROFILES: Record<string, BrandConfig> = {
  marasy: {
    id: 'marasy',
    appName: 'نظام إدارة المقابلات الأمنية - مراسي',
    appSubtitle: 'منظومة إدارة الأمن الداخلي والتوظيف - إعمار مصر',
    companyName: 'مراسي - إعمار مصر',
    securityDepartmentName: 'إدارة الأمن الداخلي - مراسي',
    logoText: 'MARASY',
    logoSubtitle: 'Security Management System',
    logoBadge: 'أمن إعمار',
    logoPath: '/marasy-logo.png',
    aiAssistantName: 'Marasy AI',
    aiAssistantRole: 'المستشار الأمني والتحليلي الذكي - مراسي',
    aiWelcomeMessage: 'مرحباً بك! أنا Marasy AI — المستشار الأمني والتحليلي الذكي لمنظومة أمن مراسي. كيف يمكنني مساعدتك اليوم؟',
    whatsappSignature: 'مع تحيات إدارة الأمن الداخلي - مراسي (إعمار مصر).',
    copyrightText: 'جميع الحقوق محفوظة © منظومة أمن مراسي - إعمار مصر',
    supportContact: 'دعم إدارة الأمن الداخلي',
    defaultSecurityCompanies: [
      'ليدز للامن والحراسه',
      'فورسيز بلس للامن والحراسة',
      'سيتي بارك ترافيك',
      'ليدز ترافيك',
      'ابكس ترافيك',
      'اخري'
    ]
  },
  vettro: {
    id: 'vettro',
    appName: 'Vettro — نظام إدارة المقابلات والأمن',
    appSubtitle: 'Intelligent Interview & Security Management System',
    companyName: 'Vettro Security',
    securityDepartmentName: 'إدارة العمليات والأمن الداخلي',
    logoText: 'VETTRO',
    logoSubtitle: 'Security Suite 2.0',
    logoBadge: 'AI Powered',
    logoPath: '/vettro-logo.png',
    aiAssistantName: 'Vettro AI',
    aiAssistantRole: 'المستشار الأمني والتحليلي الذكي',
    aiWelcomeMessage: 'مرحباً بك! أنا Vettro AI — المستشار الأمني والتحليلي الذكي. كيف يمكنني مساعدتك في المقابلات أو تقييم الشركات أو كشف المخاطر اليوم؟',
    whatsappSignature: 'مع تحيات إدارة Vettro.',
    copyrightText: 'جميع الحقوق محفوظة © Vettro Intelligent Systems',
    supportContact: 'دعم Vettro الفني',
    defaultSecurityCompanies: [
      'ليدز للامن والحراسه',
      'فورسيز بلس للامن والحراسة',
      'سيتي بارك ترافيك',
      'ليدز ترافيك',
      'ابكس ترافيك',
      'اخري'
    ]
  }
};

const ACTIVE_PROFILE_KEY = (import.meta.env.VITE_BRAND_PROFILE as string) || 'marasy';

export const APP_CONFIG: BrandConfig = BRAND_PROFILES[ACTIVE_PROFILE_KEY] || BRAND_PROFILES.marasy;

export default APP_CONFIG;

