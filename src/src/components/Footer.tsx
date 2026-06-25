import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <footer className="print-hidden" style={{
      textAlign: 'center',
      padding: '20px',
      marginTop: 'auto',
      backgroundColor: 'hsl(var(--card))',
      borderTop: '1px solid hsl(var(--border))',
      fontSize: '13px',
      color: 'hsl(var(--muted-foreground))',
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
        {isArabic ? (
          <>
            جميع الحقوق محفوظة اللواء/ماجد يوسف - صُنع بـ <Heart size={14} fill="#e74c3c" color="#e74c3c" style={{ margin: '0 2px' }} /> بواسطة شركة توينز لتطوير الويب
          </>
        ) : (
          <>
            All rights reserved. General / Magaued Youssef - Made with <Heart size={14} fill="#e74c3c" color="#e74c3c" style={{ margin: '0 2px' }} /> by Twins Web Development
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <a 
          href="https://wa.me/201552119251" 
          target="_blank" 
          rel="noreferrer" 
          title={isArabic ? "دعم فني واتساب" : "WhatsApp Technical Support"}
          style={{ color: '#25D366', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={22} />
        </a>
        <a 
          href="mailto:AhmedHusseinElsayed@outlook.com" 
          title={isArabic ? "دعم فني إيميل" : "Email Support"}
          style={{ color: '#3498db', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Mail size={22} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
