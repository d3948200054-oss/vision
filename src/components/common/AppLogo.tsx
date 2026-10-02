import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  School, 
  Compass,
  CheckCircle2
} from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showBadge?: boolean;
  className?: string;
  inverted?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showTagline = true,
  showBadge = true,
  className = '',
  inverted = false,
}) => {
  const { appLogo } = useApp();

  const renderIcon = (iconClass: string) => {
    switch (appLogo.iconName) {
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'School':
        return <School className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'GraduationCap':
      default:
        return <GraduationCap className={iconClass} />;
    }
  };

  const getContainerSizes = () => {
    switch (size) {
      case 'sm':
        return {
          iconBox: 'w-8 h-8 rounded-lg',
          iconSize: 'w-4 h-4',
          title: 'text-base font-extrabold',
          badge: 'text-[9px] px-1.5 py-0.2',
          tagline: 'text-[10px]',
        };
      case 'lg':
        return {
          iconBox: 'w-14 h-14 rounded-2xl',
          iconSize: 'w-8 h-8',
          title: 'text-3xl sm:text-4xl font-black',
          badge: 'text-xs px-2.5 py-0.5',
          tagline: 'text-sm',
        };
      case 'md':
      default:
        return {
          iconBox: 'w-10 h-10 rounded-xl',
          iconSize: 'w-6 h-6',
          title: 'text-xl font-extrabold',
          badge: 'text-[11px] px-2 py-0.5',
          tagline: 'text-xs',
        };
    }
  };

  const s = getContainerSizes();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Graphic or Image */}
      <div
        className={`${s.iconBox} shrink-0 flex items-center justify-center overflow-hidden shadow-md ${
          appLogo.type === 'image' && appLogo.imageUrl
            ? 'bg-white border border-slate-200'
            : 'bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white shadow-blue-600/25'
        }`}
      >
        {appLogo.type === 'image' && appLogo.imageUrl ? (
          <img
            src={appLogo.imageUrl}
            alt={appLogo.instituteName}
            className="w-full h-full object-cover"
          />
        ) : (
          renderIcon(s.iconSize)
        )}
      </div>

      {/* Brand Text */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${s.title} tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
            {appLogo.instituteName}
            <span className="text-blue-600 ml-1">{appLogo.highlightWord}</span>
          </span>

          {showBadge && appLogo.badgeText && (
            <span
              className={`${s.badge} font-bold uppercase tracking-wider rounded ${
                inverted
                  ? 'bg-white/20 text-indigo-100 border border-white/20'
                  : 'text-slate-600 bg-slate-100 border border-slate-200'
              }`}
            >
              {appLogo.badgeText}
            </span>
          )}
        </div>

        {showTagline && appLogo.tagline && (
          <p className={`${s.tagline} ${inverted ? 'text-indigo-200' : 'text-slate-500'} hidden sm:block leading-tight mt-0.5`}>
            {appLogo.tagline}
          </p>
        )}
      </div>
    </div>
  );
};
