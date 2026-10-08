import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <footer className="print-hidden" style={{
      textAlign: 'center',
      padding: '18px 20px',
      marginTop: 'auto',
      background: 'linear-gradient(135deg, hsl(258 42% 10%) 0%, hsl(262 42% 14%) 100%)',
      borderTop: '1px solid rgba(139,92,246,0.2)',
      fontSize: '12.5px',
    }}>
      {/* Marassi Brand Line */}
      <div style={{
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          fontSize: '14px',
          letterSpacing: '0.05em',
        }}>
          Marassi
        </span>
        <span style={{ color: 'rgba(196,181,253,0.4)', fontSize: '10px' }}>•</span>
        <span style={{ color: 'rgba(196,181,253,0.65)', fontSize: '12px' }}>
          {isArabic ? 'نظام إدارة المقابلات' : 'Interview Management System'}
        </span>
      </div>

      {/* Rights */}
      <div style={{
        marginBottom: '12px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '4px',
        color: 'rgba(196,181,253,0.7)',
      }}>
        {isArabic ? (
          <>
            جميع الحقوق محفوظة اللواء/ماجد يوسف &nbsp;|&nbsp; صُنع بـ <Heart size={13} fill="#8B5CF6" color="#8B5CF6" style={{ margin: '0 2px' }} /> بواسطة شركة توينز لتطوير الويب
          </>
        ) : (
          <>
            All rights reserved &nbsp;|&nbsp; Made with <Heart size={13} fill="#8B5CF6" color="#8B5CF6" style={{ margin: '0 2px' }} /> by Twins Web Development
          </>
        )}
      </div>

      {/* Contact Icons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <a
          href="https://wa.me/201552962516"
          target="_blank"
          rel="noreferrer"
          title={isArabic ? "دعم فني واتساب" : "WhatsApp Support"}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.2)',
            color: '#25D366',
            transition: 'transform 0.2s, background 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.background = 'rgba(37,211,102,0.22)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(37,211,102,0.12)' }}
        >
          <MessageCircle size={18} />
        </a>
        <a
          href="mailto:AhmedHusseinElsayed@outlook.com"
          title={isArabic ? "دعم فني إيميل" : "Email Support"}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.2)',
            color: '#A78BFA',
            transition: 'transform 0.2s, background 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.background = 'rgba(139,92,246,0.25)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(139,92,246,0.12)' }}
        >
          <Mail size={18} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;

