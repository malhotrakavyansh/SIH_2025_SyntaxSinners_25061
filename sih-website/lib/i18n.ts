import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ne", label: "नेपाली" },
  { code: "bo", label: "བོད་ཡིག" },
  { code: "lim", label: "लिम्बु" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

const resources = {
  en: {
    translation: {
      brand: { name: "Sangha" },
      intro: {
        title: "Sangha",
        subtitle: "A digital window into Sikkim's monasteries",
        enter: "Enter",
        explore: "Explore",
      },
      nav: {
        contributions: "Contributions",
        mediaContribution: "Media Contribution",
        dataContribution: "Data Contribution",
        bookings: "Bookings",
        retreat: "Sangha Retreat",
        searchPlaceholder: "Search…",
        home: "Home",
        overview: "Overview",
        map: "Map",
        monasteries: "Monasteries",
        archive: "Digital Archive",
        language: "Language",
        adminLogin: "Login as Admin",
      },
      hero: {
        headingTop: "DIGITALIZING",
        headingBottom: "SIKKIM",
        tagline: "Preserving sacred stories forever.",
        scroll: "Scroll To Explore",
      },
      footer: {
        title: "Treasures of Sikkim",
        rights: "© 2025 All rights reserved",
      },
      slideshow: {
        heading: "Sacred Monasteries",
        subtitle: "Explore the spiritual heart of Sikkim through its ancient monasteries.",
        cta: "Slide in",
        founded: "Founded in {{year}}",
        monasteries: {
          tashiding: {
            name: "Tashiding Monastery",
            location: "West Sikkim",
            description:
              "Revered as the 'Venerated Central Glory', Tashiding is vital to Sikkimese monasticism, its sublime mountain site and stupa are iconic. A single image is said to cleanse one's sins.",
          },
          tsuk: {
            name: "Tsuk La Khang Monastery",
            location: "Gangtok, East Sikkim",
            description:
              "Tsuk La Khang Monastery, located in the heart of Gangtok, is the former royal chapel of the Chogyal dynasty and one of Sikkim’s most significant centres of Buddhist learning.",
          },
          dubdi: {
            name: "Dubdi Monastery",
            location: "Yuksom, West Sikkim",
            description:
              "The 'Hermit's Cell', Dubdi, is Sikkim's first monastery, its stone chapel marking the crowning of the kingdom's Buddhist order.",
          },
          rumtek: {
            name: "Rumtek Monastery",
            location: "East Sikkim",
            description:
              "Grand and imposing, Rumtek is the Dharma Chakra Centre, stunning, alive with ritual, color, and living tradition.",
          },
        },
      },
      map: {
        heading: "Explore Sikkim's Sacred Geography",
        subtitle: "Navigate through the mystical landscape of Sikkim and discover monasteries nestled in the Himalayas.",
        hoverInstruction: "Hover over each location to learn more.",
        detailsTitle: "Monastery details",
        clickInstruction: "Click on any monastery marker to view the details",
        defaultVisitors: "165K+ Annual visitors",
        locationLabel: "Location",
        monasteries: {
          tashiding: {
            name: "Tashiding Monastery",
            location: "West Sikkim",
            description: "Tashiding is vital to Sikkimese monasticism, its sublime mountain site and stupa are iconic.",
            visitors: "165K+ Annual visitors",
          },
          tsuk: {
            name: "Tsuk La Khang Monastery",
            location: "Gangtok, East Sikkim",
            description: "Tsuk La Khang is the royal chapel of the former monarchs of Sikkim, a place of worship and assembly.",
            visitors: "100K+ Annual visitors",
          },
          dubdi: {
            name: "Dubdi Monastery",
            location: "Yuksom, West Sikkim",
            description: "Dubdi is Sikkim's first monastery, its stone chapel marking the crowning of the kingdom's Buddhist order.",
            visitors: "80K+ Annual visitors",
          },
          rumtek: {
            name: "Rumtek Monastery",
            location: "East Sikkim",
            description: "Rumtek is the Dharma Chakra Centre, stunning, alive with ritual, color, and living tradition.",
            visitors: "200K+ Annual visitors",
          },
        },
      },
      monasteryPage: {
        sections: {
          overview: "Overview",
          digitalArchive: "Digital Archive",
          culturalCalendar: "Cultural Calendar",
          audioTour: "Audio Tour",
          virtualTour: "Virtual Tour",
        },
        common: {
          locationMap: "Location Map",
          explore: "Explore",
          viewDetails: "View Details",
          close: "Close",
          download: "Download",
          playAudio: "Play Audio",
          pauseAudio: "Pause Audio",
        },
      },
    },
  },
  hi: {
    translation: {
      brand: { name: "Sangha" },
      intro: {
        title: "Sangha",
        subtitle: "सिक्किम के मठों की डिजिटल झलक",
        enter: "प्रवेश करें",
        explore: "अन्वेषण करें",
      },
      nav: {
        contributions: "योगदान",
        mediaContribution: "मीडिया योगदान",
        dataContribution: "डेटा योगदान",
        bookings: "बुकिंग",
        retreat: "संघ रिट्रीट",
        searchPlaceholder: "खोजें...",
        home: "होम",
        overview: "सारांश",
        map: "मानचित्र",
        monasteries: "मठ",
        archive: "डिजिटल अभिलेखागार",
        language: "भाषा",
        adminLogin: "प्रशासक के रूप में लॉगिन करें",
      },
      hero: {
        headingTop: "डिजिटलाइजिंग",
        headingBottom: "सिक्किम",
        tagline: "पवित्र कहानियों को सदा के लिए संजोना",
        scroll: "और देखने के लिए नीचे स्क्रॉल करें",
      },
      footer: {
        title: "सिक्किम के खजाने",
        rights: "© 2025 सर्वाधिकार सुरक्षित",
      },
      slideshow: {
        heading: "पवित्र मठ",
        subtitle: "सिक्किम के प्राचीन मठों के आध्यात्मिक हृदय की खोज करें।",
        cta: "अंदर देखें",
        founded: "स्थापित {{year}}",
        monasteries: {
          tashiding: {
            name: "ताशिडिंग मठ",
            location: "पश्चिम सिक्किम",
            description:
              "'वेनरेटेड सेंट्रल ग्लोरी' के रूप में पूजित ताशिडिंग मठ सिक्किम के मठवाद का मूल है; इसका पर्वतीय स्थल और स्तूप प्रतीकात्मक हैं। माना जाता है कि इसकी एक झलक पापों को शुद्ध करती है।",
          },
          tsuk: {
            name: "त्सुक ला खांग मठ",
            location: "गंगटोक, पूर्व सिक्किम",
            description:
              "गंगटोक के केंद्र में स्थित त्सुक ला खांग पूर्व चोग्याल वंश का शाही प्रार्थनालय था और सिक्किम के सबसे महत्वपूर्ण बौद्ध शिक्षण केंद्रों में एक है।",
          },
          dubdi: {
            name: "दुब्दी मठ",
            location: "युकसोम, पश्चिम सिक्किम",
            description:
              "'हरमिट्स सेल' के नाम से प्रसिद्ध दुब्दी सिक्किम का पहला मठ है; इसका पत्थर का चैपल राज्य के बौद्ध क्रम के उदय को दर्शाता है।",
          },
          rumtek: {
            name: "रूमटेक मठ",
            location: "पूर्व सिक्किम",
            description:
              "भव्य रूमटेक धर्म चक्र केंद्र है—रंग, अनुष्ठान और जीवंत परंपरा से परिपूर्ण।",
          },
        },
      },
      map: {
        heading: "सिक्किम की पवित्र भूगोल की खोज करें",
        subtitle: "सिक्किम के रहस्यमय परिदृश्य में यात्रा करें और हिमालय में बसे मठों की खोज करें।",
        hoverInstruction: "अधिक जानने के लिए प्रत्येक स्थान पर होवर करें।",
        detailsTitle: "मठ विवरण",
        clickInstruction: "विवरण देखने के लिए किसी भी मठ मार्कर पर क्लिक करें",
        defaultVisitors: "165K+ वार्षिक आगंतुक",
        locationLabel: "स्थान",
        monasteries: {
          tashiding: {
            name: "ताशिडिंग मठ",
            location: "पश्चिम सिक्किम",
            description: "ताशिडिंग सिक्किम के मठवाद के लिए महत्वपूर्ण है, इसका उदात्त पर्वतीय स्थल और स्तूप प्रतीकात्मक हैं।",
            visitors: "165K+ वार्षिक आगंतुक",
          },
          tsuk: {
            name: "त्सुक ला खांग मठ",
            location: "गंगटोक, पूर्व सिक्किम",
            description: "त्सुक ला खांग सिक्किम के पूर्व राजाओं का शाही प्रार्थनालय है, एक पूजा और सभा का स्थान।",
            visitors: "100K+ वार्षिक आगंतुक",
          },
          dubdi: {
            name: "दुब्दी मठ",
            location: "युकसोम, पश्चिम सिक्किम",
            description: "दुब्दी सिक्किम का पहला मठ है, इसका पत्थर का चैपल राज्य के बौद्ध क्रम के उदय को चिह्नित करता है।",
            visitors: "80K+ वार्षिक आगंतुक",
          },
          rumtek: {
            name: "रूमटेक मठ",
            location: "पूर्व सिक्किम",
            description: "रूमटेक धर्म चक्र केंद्र है, आश्चर्यजनक, अनुष्ठान, रंग और जीवित परंपरा से भरपूर।",
            visitors: "200K+ वार्षिक आगंतुक",
          },
        },
      },
      monasteryPage: {
        sections: {
          overview: "सारांश",
          digitalArchive: "डिजिटल अभिलेखागार",
          culturalCalendar: "सांस्कृतिक कैलेंडर",
          audioTour: "ऑडियो टूर",
          virtualTour: "वर्चुअल टूर",
        },
        common: {
          locationMap: "स्थान मानचित्र",
          explore: "अन्वेषण करें",
          viewDetails: "विवरण देखें",
          close: "बंद करें",
          download: "डाउनलोड",
          playAudio: "ऑडियो चलाएं",
          pauseAudio: "ऑडियो रोकें",
        },
      },
    },
  },
  ne: {
    translation: {
      brand: { name: "Sangha" },
      intro: {
        title: "Sangha",
        subtitle: "सिक्किमका गुम्बाहरूको डिजिटल झ्याल",
        enter: "प्रवेश गर्नुहोस्",
        explore: "अन्वेषण गर्नुहोस्",
      },
      nav: {
        contributions: "योगदान",
        mediaContribution: "मिडिया योगदान",
        dataContribution: "डेटा योगदान",
        bookings: "बुकिङ",
        retreat: "सङ्घ रिट्रिट",
        searchPlaceholder: "खोज्नुहोस्...",
        home: "गृहपृष्ठ",
        overview: "अवलोकन",
        map: "नक्सा",
        monasteries: "गुम्बा",
        archive: "डिजिटल अभिलेख",
        language: "भाषा",
        adminLogin: "प्रशासकको रूपमा लगइन गर्नुहोस्",
      },
      hero: {
        headingTop: "डिजिटलाइज गर्दै",
        headingBottom: "सिक्किम",
        tagline: "पवित्र कथाहरू सधैंका लागि संरक्षण",
        scroll: "अन्वेषण गर्न तल स्क्रोल गर्नुहोस्",
      },
      footer: {
        title: "सिक्किमका सम्पदा",
        rights: "© 2025 सबै अधिकार सुरक्षित",
      },
      slideshow: {
        heading: "पवित्र गुम्बा",
        subtitle: "सिक्किमका प्राचीन गुम्बाहरूको आध्यात्मिक केन्द्रको अन्वेषण गर्नुहोस्।",
        cta: "भित्र जानुहोस्",
        founded: "स्थापित {{year}}",
        monasteries: {
          tashiding: {
            name: "ताशिडिङ गुम्बा",
            location: "पश्चिम सिक्किम",
            description:
              "'मध्य महिमा' को रुपमा सम्मानित ताशिडिङ सिक्किमेली गुम्बा परम्पराको मूल हो; यसको पर्वतीय स्थान र स्तूप प्रतीकात्मक छन्। एउटा दर्शनले पाप शुद्ध हुने विश्वास छ।",
          },
          tsuk: {
            name: "त्सुक ला खाङ्ग गुम्बा",
            location: "गन्तोक, पूर्व सिक्किम",
            description:
              "गन्तोकको मुटुमा रहेको त्सुक ला खाङ्ग पहिले चोग्याल राजपरिवारको प्रार्थना गृह थियो र सिक्किमका महत्वपूर्ण बौद्ध शिक्षण केन्द्रमध्ये एक हो।",
          },
          dubdi: {
            name: "दुब्दी गुम्बा",
            location: "युक्सोम, पश्चिम सिक्किम",
            description:
              "'हरमिट्स सेल' भनेर चिनिने दुब्दी सिक्किमको पहिलो गुम्बा हो; यसको ढुंगाको चैपलले राज्यको बौद्ध क्रमको उदय देखाउँछ।",
          },
          rumtek: {
            name: "रुमटेक गुम्बा",
            location: "पूर्व सिक्किम",
            description:
              "भव्य रुमटेक धर्म चक्र केन्द्र हो—रङ, अनुष्ठान र जीवित परम्पराले भरिपूर्ण।",
          },
        },
      },
      map: {
        heading: "सिक्किमको पवित्र भूगोलको अन्वेषण गर्नुहोस्",
        subtitle: "सिक्किमको रहस्यमय परिदृश्यमा यात्रा गर्नुहोस् र हिमालयमा बसेका गुम्बाहरू खोज्नुहोस्।",
        hoverInstruction: "थप जान्नको लागि प्रत्येक स्थानमा होवर गर्नुहोस्।",
        detailsTitle: "गुम्बा विवरण",
        clickInstruction: "विवरण हेर्न कुनै पनि गुम्बा मार्करमा क्लिक गर्नुहोस्",
        defaultVisitors: "165K+ वार्षिक आगन्तुकहरू",
        locationLabel: "स्थान",
        monasteries: {
          tashiding: {
            name: "ताशिडिङ गुम्बा",
            location: "पश्चिम सिक्किम",
            description: "ताशिडिङ सिक्किमेली गुम्बा परम्पराका लागि महत्वपूर्ण छ, यसको उदात्त पर्वतीय स्थान र स्तूप प्रतीकात्मक छन्।",
            visitors: "165K+ वार्षिक आगन्तुकहरू",
          },
          tsuk: {
            name: "त्सुक ला खाङ्ग गुम्बा",
            location: "गन्तोक, पूर्व सिक्किम",
            description: "त्सुक ला खाङ्ग सिक्किमका पूर्व राजाहरूको शाही प्रार्थना गृह हो, एक उपासना र सभाको स्थान।",
            visitors: "100K+ वार्षिक आगन्तुकहरू",
          },
          dubdi: {
            name: "दुब्दी गुम्बा",
            location: "युक्सोम, पश्चिम सिक्किम",
            description: "दुब्दी सिक्किमको पहिलो गुम्बा हो, यसको ढुंगाको चैपलले राज्यको बौद्ध क्रमको उदय चिन्ह लगाउँछ।",
            visitors: "80K+ वार्षिक आगन्तुकहरू",
          },
          rumtek: {
            name: "रुमटेक गुम्बा",
            location: "पूर्व सिक्किम",
            description: "रुमटेक धर्म चक्र केन्द्र हो, आश्चर्यजनक, अनुष्ठान, रङ र जीवित परम्परासँग भरिपूर्ण।",
            visitors: "200K+ वार्षिक आगन्तुकहरू",
          },
        },
      },
      monasteryPage: {
        sections: {
          overview: "अवलोकन",
          digitalArchive: "डिजिटल अभिलेख",
          culturalCalendar: "सांस्कृतिक पात्रो",
          audioTour: "अडियो टूर",
          virtualTour: "भर्चुअल टूर",
        },
        common: {
          locationMap: "स्थान नक्सा",
          explore: "अन्वेषण गर्नुहोस्",
          viewDetails: "विवरण हेर्नुहोस्",
          close: "बन्द गर्नुहोस्",
          download: "डाउनलोड",
          playAudio: "अडियो चलाउनुहोस्",
          pauseAudio: "अडियो रोक्नुहोस्",
        },
      },
    },
  },
  bo: {
    translation: {
      brand: { name: "Sangha" },
      intro: {
        title: "Sangha",
        subtitle: "སིག་གིས་མཆོད་རྟེན་ལ་ཕྱིར་གཅོད་ཀྱིས་ཐུགས་རྒྱུད་",
        enter: "ནང་དུ་ཞུགས་པ་",
        explore: "ལ་གཞིགས་པ་",
      },
      nav: {
        contributions: "རམ་འདེགས་",
        mediaContribution: "སྣེ་ཆས་རམ་འདེགས་",
        dataContribution: "གཏུབ་རིས་རམ་འདེགས་",
        bookings: "གཏན་འབེབས་གླེང་སྟེགས་",
        retreat: "Sangha གདུང་སེལ་",
        searchPlaceholder: "བཤེགས་པ་",
        home: "ཁང་པ་",
        overview: "གླེང་སྟེགས་",
        map: "ས་གནས་",
        archive: "ཉེ་གཞི་ལོ་རྒྱུས་",
        language: "སྐད་ཡིག་",
      },
      hero: {
        headingTop: "གཏུབ་རིས་བརྒྱུག་སྒོ་",
        headingBottom: "སིག་གི་",
        tagline: "གདུང་བ་རིས་ཀྱི་ལམ་གསུང་",
        scroll: "སྟེགས་བུ་དང་རམ་འདེགས་",
      },
      footer: {
        title: "སིག་གི་རིན་ཆེན་",
        rights: "© 2025 གཙོ་བོ་ཀུན་",
      },
      slideshow: {
        heading: "དམ་པའི་མཆོད་རྟེན་",
        subtitle: "སིག་གི་རྙིང་པའི་མཆོད་རྟེན་ཕྱིར་འདེགས་",
        cta: "ནང་དུ་ཞུགས་",
        founded: "ལོ་སྨ་ཕོད་{{year}}",
        monasteries: {
          tashiding: {
            name: "བཀྲ་ཤིས་དིང་མཆོད་རྟེན་",
            location: "ནུབ་སིག་གི་",
            description: "བཀྲ་ཤིས་དིང་སིག་གི་མཆོད་རྟེན་དགོས་མེད་མེད་",
          },
          tsuk: {
            name: "བཙུགས་ལ་ཁང་གི་མཆོད་རྟེན་",
            location: "གངས་ཐོག་ཤར་སིག་གི་",
            description: "བཙུགས་ལ་ཁང་རྒྱལ་པོའི་ལྕགས་མཆོད་རྟེན་",
          },
          dubdi: {
            name: "དགེ་དི་གི་མཆོད་རྟེན་",
            location: "ཡུལ་གསོམ་ནུབ་སིག་གི་",
            description: "དགེ་དི་སིག་གི་དང་པོའི་མཆོད་རྟེན་",
          },
          rumtek: {
            name: "རུ་མེ་ཀ་མཆོད་རྟེན་",
            location: "ཤར་སིག་གི་",
            description: "རུ་མེ་ཀ་ཆོས་འཁོར་གསང་ལྡན་",
          },
        },
      },
      map: {
        heading: "སིག་གི་དམ་པའི་གནས་ཆེན་",
        subtitle: "སིག་གི་བྱིས་པའི་ས་གནས་གཞིགས་ནས་གཏང་སེལ་མཆོད་རྟེན་",
        hoverInstruction: "ས་གནས་ཀུན་ལ་མཐོང་བ་གདུགས་པ་",
        detailsTitle: "མཆོད་རྟེན་ཡིད་ཆ་",
        clickInstruction: "མཆོད་རྟེན་རྫོགས་གཏུབ་ལ་ཆེགས་བུ་གདུགས་པ་",
        defaultVisitors: "165K+ གདུང་སེལ་ཕྱི་མེད་",
        locationLabel: "ས་གནས་",
        monasteries: {
          tashiding: {
            name: "བཀྲ་ཤིས་དིང་མཆོད་རྟེན་",
            location: "ནུབ་སིག་གི་",
            description: "བཀྲ་ཤིས་དིང་དགོས་མེད་དགེ་ཙོགས་",
            visitors: "165K+ གདུང་སེལ་ཕྱི་མེད་",
          },
          tsuk: {
            name: "བཙུགས་ལ་ཁང་གི་མཆོད་རྟེན་",
            location: "གངས་ཐོག་ཤར་སིག་གི་",
            description: "བཙུགས་ལ་ཁང་རྒྱལ་པོའི་གཙོ་",
            visitors: "100K+ གདུང་སེལ་ཕྱི་མེད་",
          },
          dubdi: {
            name: "དགེ་དི་གི་མཆོད་རྟེན་",
            location: "ཡུལ་གསོམ་ནུབ་སིག་གི་",
            description: "དགེ་དི་སིག་གི་དང་པོའི་",
            visitors: "80K+ གདུང་སེལ་ཕྱི་མེད་",
          },
          rumtek: {
            name: "རུ་མེ་ཀ་མཆོད་རྟེན་",
            location: "ཤར་སིག་གི་",
            description: "རུ་མེ་ཀ་ཆོས་འཁོར་དགེ་ཙོགས་",
            visitors: "200K+ གདུང་སེལ་ཕྱི་མེད་",
          },
        },
      },
      monasteryPage: {
        sections: {
          overview: "གླེང་སྟེགས་",
          digitalArchive: "ཉེ་གཞི་ལོ་རྒྱུས་",
          culturalCalendar: "ལོ་ཆེན་རིས་",
          audioTour: "སྐད་ཆ་ལ་གཞིགས་",
          virtualTour: "གཏུབ་རིས་ལ་གཞིགས་",
        },
        common: {
          locationMap: "ས་གནས་ས་ཆ་",
          explore: "ལ་གཞིགས་པ་",
          viewDetails: "ཡིད་ཆ་གཞིགས་པ་",
          close: "སྲིད་བུ་དགེ་",
          download: "སྐོར་ནས་ལེན་",
          playAudio: "སྐད་ཆ་བརྒྱུག་པ་",
          pauseAudio: "སྐད་ཆ་སྲོག་པ་",
        },
      },
    },
  },
  lim: {
    translation: {
      brand: { name: "Sangha" },
      intro: {
        title: "Sangha",
        subtitle: "सिक्किमका पवित्र मठहरूमा डिजिटल गलफन",
        enter: "प्रवेश गर्नुहोस्",
        explore: "अन्वेषण गर्नुहोस्",
      },
      nav: {
        contributions: "योगदान",
        mediaContribution: "मिडिया योगदान",
        dataContribution: "डेटा योगदान",
        bookings: "बुकिङ",
        retreat: "सङ्घ रिट्रिट",
        searchPlaceholder: "खोज्नुहोस्...",
        home: "गृहपृष्ठ",
        overview: "अवलोकन",
        map: "नक्सा",
        archive: "डिजिटल अभिलेख",
        language: "भाषा",
      },
      hero: {
        headingTop: "डिजिटलाइज गर्दै",
        headingBottom: "सिक्किम",
        tagline: "पवित्र कथाहरू सधैंका लागि संरक्षण",
        scroll: "अन्वेषण गर्न तल स्क्रोल गर्नुहोस्",
      },
      footer: {
        title: "सिक्किमका सम्पदा",
        rights: "© 2025 सबै अधिकार सुरक्षित",
      },
      slideshow: {
        heading: "पवित्र गुम्बा",
        subtitle: "सिक्किमका प्राचीन गुम्बाहरूको आध्यात्मिक केन्द्रको अन्वेषण गर्नुहोस्।",
        cta: "भित्र जानुहोस्",
        founded: "स्थापित {{year}}",
        monasteries: {
          tashiding: {
            name: "ताशिडिङ गुम्बा",
            location: "पश्चिम सिक्किम",
            description: "ताशिडिङ सिक्किमेली गुम्बा परम्पराका लागि महत्वपूर्ण छ।",
          },
          tsuk: {
            name: "त्सुक ला खाङ्ग गुम्बा",
            location: "गन्तोक, पूर्व सिक्किम",
            description: "त्सुक ला खाङ्ग सिक्किमका पूर्व राजाहरूको शाही प्रार्थना गृह हो।",
          },
          dubdi: {
            name: "दुब्दी गुम्बा",
            location: "युक्सोम, पश्चिम सिक्किम",
            description: "दुब्दी सिक्किमको पहिलो गुम्बा हो।",
          },
          rumtek: {
            name: "रुमटेक गुम्बा",
            location: "पूर्व सिक्किम",
            description: "रुमटेक धर्म चक्र केन्द्र हो।",
          },
        },
      },
      map: {
        heading: "सिक्किमको पवित्र भूगोलको अन्वेषण गर्नुहोस्",
        subtitle: "सिक्किमको रहस्यमय परिदृश्यमा यात्रा गर्नुहोस् र हिमालयमा बसेका गुम्बाहरू खोज्नुहोस्।",
        hoverInstruction: "थप जान्नको लागि प्रत्येक स्थानमा होवर गर्नुहोस्।",
        detailsTitle: "गुम्बा विवरण",
        clickInstruction: "विवरण हेर्न कुनै पनि गुम्बा मार्करमा क्लिक गर्नुहोस्",
        defaultVisitors: "165K+ वार्षिक आगन्तुकहरू",
        locationLabel: "स्थान",
        monasteries: {
          tashiding: {
            name: "ताशिडिङ गुम्बा",
            location: "पश्चिम सिक्किम",
            description: "ताशिडिङ सिक्किमेली गुम्बा परम्पराका लागि महत्वपूर्ण छ।",
            visitors: "165K+ वार्षिक आगन्तुकहरू",
          },
          tsuk: {
            name: "त्सुक ला खाङ्ग गुम्बा",
            location: "गन्तोक, पूर्व सिक्किम",
            description: "त्सुक ला खाङ्ग सिक्किमका पूर्व राजाहरूको शाही प्रार्थना गृह हो।",
            visitors: "100K+ वार्षिक आगन्तुकहरू",
          },
          dubdi: {
            name: "दुब्दी गुम्बा",
            location: "युक्सोम, पश्चिम सिक्किम",
            description: "दुब्दी सिक्किमको पहिलो गुम्बा हो।",
            visitors: "80K+ वार्षिक आगन्तुकहरू",
          },
          rumtek: {
            name: "रुमटेक गुम्बा",
            location: "पूर्व सिक्किम",
            description: "रुमटेक धर्म चक्र केन्द्र हो।",
            visitors: "200K+ वार्षिक आगन्तुकहरू",
          },
        },
      },
      monasteryPage: {
        sections: {
          overview: "अवलोकन",
          digitalArchive: "डिजिटल अभिलेख",
          culturalCalendar: "सांस्कृतिक पात्रो",
          audioTour: "अडियो टूर",
          virtualTour: "भर्चुअल टूर",
        },
        common: {
          locationMap: "स्थान नक्सा",
          explore: "अन्वेषण गर्नुहोस्",
          viewDetails: "विवरण हेर्नुहोस्",
          close: "बन्द गर्नुहोस्",
          download: "डाउनलोड",
          playAudio: "अडियो चलाउनुहोस्",
          pauseAudio: "अडियो रोक्नुहोस्",
        },
      },
    },
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
  });
}

export default i18n;
