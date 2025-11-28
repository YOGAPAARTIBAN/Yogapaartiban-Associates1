export interface TeamMember {
  id: string;
  name: string;
  role: string;
  qualifications?: string;
  bio: string;
  image?: string; // URL or placeholder
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string; // To map to Lucide icons
  videoUrl?: string; // URL for the service video
}

export interface SiteContent {
  general: {
    phone: string;
    email: string;
    address: string;
    tagline: string;
    heroImage: string;
    accentColor: string; // hex
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    introText: string;
    maintenance: {
      enabled: boolean;
      date: string;
    };
  };
  about: {
    founder: TeamMember;
    executives: TeamMember[];
    cas: TeamMember[];
    associatesText: string;
  };
  services: Service[];
  disclaimer: {
    popupText: string;
    footerText: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}