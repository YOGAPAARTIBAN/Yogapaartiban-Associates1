import { SiteContent } from './types';

export const INITIAL_CONTENT: SiteContent = {
  general: {
    phone: "+91 44 1234 5678",
    email: "support@yogapaartibanassociates.com",
    address: "Chennai | Madurai | Hyderabad | Bangalore | Delhi | Cochin | Navi Mumbai",
    tagline: "Legal Mastery Meets Technical Insight",
    // Updated to a premium conference room image
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920",
    accentColor: "#C5A059", // Gold/Bronze
  },
  home: {
    heroTitle: "YOGAPAARTIBAN ASSOCIATES",
    heroSubtitle: "Excellence in Legal Counsel & Corporate Compliance",
    introText: "We provide comprehensive legal solutions with a focus on commercial integrity, technological advancement, and global compliance.",
    maintenance: {
      enabled: false,
      date: "31/12/2024"
    }
  },
  about: {
    founder: {
      id: "founder",
      name: "Yogapaartiban AP",
      role: "Founder & Owner",
      qualifications: "B.E., M.S./M.Tech., Ph.D, B.L., ACCA",
      bio: "Yogapaartiban brings a unique and powerful combination of deep technical understanding and established legal mastery to his practice. He has also completed numerous certifications/diplomas in networking, psychology, forensic accounting, medical compliance, and hospital compliance. With over 10 years of standing experience as a counsel, he has successfully argued cases across various high courts, district courts, the Supreme Court, and specialized tribunals such as DRT, Labour Courts, Commercial Courts, TNPID, and RERA. His expertise includes startup registration, GST compliance, cyber forensics, labour law, and hospital compliance. Before his legal career, he worked in multiple software companies, notably as a Project Manager (Network Specialist) and briefly as a CFO, giving him deep commercial and technological insight beneficial to his clients.",
      // Updated to a professional male portrait
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    },
    executives: [
      {
        id: "exec1",
        name: "Rajesh M",
        role: "Executive Advocate",
        qualifications: "B.A., B.L., M.L. (UK)",
        bio: "Rajesh is a highly skilled advocate with 12 years of standing experience, representing clients in both civil and criminal matters across high courts and district courts. Rajesh specializes in civil suits, document verification, and registration. His expertise in real estate disputes is strengthened by his family’s three generations of experience in the real estate sector.",
      },
      {
        id: "exec2",
        name: "Yuvaraj Mv",
        role: "Executive Advocate",
        qualifications: "B.Com., M.B.A., B.L.",
        bio: "Yuvaraj holds 10 years of experience handling civil and criminal matters across multiple courts. His specializations include Motor Vehicle Act cases, PF claims, and Consumer Court litigation. His prior experience in the Food Corporation of India gives him valuable insight into statutory compliance and government operations.",
      },
      {
        id: "exec3",
        name: "Sathish Kumar S",
        role: "Executive Advocate",
        qualifications: "B.A., M.A., M.Phil., L.L.B.",
        bio: "With 10 years of standing experience, Sathish has handled civil and criminal matters across high courts and district courts. He specializes in international adjudicating matters and embassy-related legal issues. His experience as a Consulate for Germany at the Indian Embassy gives him deep exposure to diplomatic and international legal procedures.",
      }
    ],
    cas: [
      {
        id: "ca1",
        name: "Harsha Reddy",
        role: "Chartered Accountant",
        bio: "A highly competent Chartered Accountant with 5 years of experience in taxation, auditing, financial planning, and compliance. Skilled in preparing financial statements, tax filings, and providing strategic financial advice."
      },
      {
        id: "ca2",
        name: "Riaz Mohammed",
        role: "Chartered Accountant",
        bio: "A Chartered Accountant with 5 years of experience in statutory audit, tax advisory, and internal controls. Skilled in Tally, SAP, and advanced financial modelling, offering insights that enhance business growth."
      }
    ],
    associatesText: "We work with numerous dedicated associates and interns operating across India and abroad, ensuring our clients receive timely and effective representation wherever they are.",
  },
  services: [
    {
      id: "srv1",
      title: "GST Services",
      description: "Comprehensive Goods and Services Tax solutions including registration, filing returns, compliance audits, and representation in litigations. We ensure your business adheres to the latest tax regulations.",
      iconName: "Calculator",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" // Sample video
    },
    {
      id: "srv2",
      title: "Startup and Business Support",
      description: "End-to-end support for new ventures, from entity selection (LLP, Pvt Ltd, OPC) to incorporation, obtaining necessary licenses, and ongoing statutory compliance management.",
      iconName: "Rocket",
    },
    {
      id: "srv3",
      title: "Hospital & Medical Compliance",
      description: "Specialized legal services for healthcare institutions covering clinical establishment registration, medical device regulations, and handling medico-legal cases with expert precision.",
      iconName: "Stethoscope",
    },
    {
      id: "srv4",
      title: "Immigration Services",
      description: "Expert guidance on visa applications, work permits, and citizenship matters. We assist individuals and corporations in navigating complex international immigration laws.",
      iconName: "Globe",
    },
    {
      id: "srv6",
      title: "IPR Services",
      description: "Protection of Intellectual Property Rights including trademarks, patents, copyrights, and designs. We handle filing, prosecution, and litigation to safeguard your innovations.",
      iconName: "ShieldCheck",
    },
    {
      id: "srv7",
      title: "Real Estate Services",
      description: "Legal assistance in property documentation, title verification, RERA compliance, lease agreements, and dispute resolution for residential and commercial properties.",
      iconName: "Home",
    },
    {
      id: "srv8",
      title: "Export & Import Services",
      description: "Advisory on DGFT policies, IEC registration, customs clearance disputes, and international trade contracts to facilitate smooth cross-border commerce.",
      iconName: "Ship",
    },
    {
      id: "srv9",
      title: "Banking, NBFC and Fintech",
      description: "Specialized advisory for Banks, NBFCs, and Fintech companies on regulatory compliance, RBI guidelines, loan documentation, and financial dispute resolution.",
      iconName: "Landmark",
    },
  ],
  posts: [
    {
      id: "p1",
      title: "Understanding GST Compliance for Startups",
      date: "October 15, 2023",
      excerpt: "Navigating the complexities of Goods and Services Tax can be daunting for new businesses. Here is a comprehensive guide to getting started with GST filings and compliance requirements.",
      image: "https://images.unsplash.com/photo-1554224155-98406852d009?auto=format&fit=crop&q=80&w=800",
      externalUrl: "#"
    },
    {
      id: "p2",
      title: "The Role of Cyber Forensics in Modern Litigation",
      date: "September 22, 2023",
      excerpt: "Digital evidence is becoming central to many legal battles. Learn how cyber forensics is reshaping the courtroom landscape and why digital trail matters in corporate disputes.",
      image: "https://images.unsplash.com/photo-1563206767-5b1d972d9fb7?auto=format&fit=crop&q=80&w=800"
    }
  ],
  disclaimer: {
    popupText: "As per the rules of the Bar Council of India, law firms are not permitted to solicit work and advertise. By clicking the “Agree” button and accessing this website YOGAPAARTIBAN ASSOCIATES, the user fully accepts that you are seeking information of your own accord and volition and that no form of solicitation has taken place by the Firm or its members.\n\nThe information provided under this website is solely available at your request for information purposes only. It should not be interpreted as soliciting or advertisement. The firm is not liable for any consequence of any action taken by the user relying on material / information provided under this website. In cases where the user has any legal issues, he/she in all cases must seek independent legal advice.",
    footerText: "This website is for informational purposes only and complies with the rules of the Bar Council of India prohibiting solicitation and advertising. Nothing on this site should be construed as legal advice. Users must seek independent legal counsel for their specific issues.",
  },
  credentials: {
    username: "ya_team",
    password: "team_ay"
  }
};