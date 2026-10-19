import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brandName: 'FairFarm',
    tagline: 'Direct Market Access for Marginal Farmers',
    subtitle: 'Connecting smallholder growers directly with retailers, hotels, and wholesalers without middlemen.',

    // Navigation
    navMarketplace: 'Marketplace',
    navDashboard: 'Dashboard',
    navMyListings: 'My Listings',
    navMyOffers: 'My Offers',
    navOrders: 'Orders',
    navTransport: 'Shared Transport',
    navLogin: 'Login',
    navRegister: 'Register',
    navLogout: 'Sign Out',

    // Roles
    roleFarmer: 'Farmer / Grower',
    roleBuyer: 'Direct Buyer / Business',

    // Dashboard & Metrics
    totalListings: 'Active Listings',
    pendingOffers: 'Pending Offers',
    totalOrders: 'Total Orders',
    netRevenueEarned: 'Net Revenue Earned',
    createNewListing: 'List New Produce',
    offersAwaitingReview: 'Offers Awaiting Review',
    viewAllListings: 'View All Listings',

    // Marketplace
    browseProduce: 'Fresh Harvest Marketplace',
    searchPlaceholder: 'Search crops by name (e.g. Tomatoes, Basmati Rice)...',
    filterCategory: 'All Categories',
    filterAll: 'All',
    filterVegetables: 'Vegetables',
    filterFruits: 'Fruits',
    filterGrains: 'Grains',
    filterDairy: 'Dairy',
    filterSpices: 'Spices',
    filterPulses: 'Pulses',
    filterOrganicOnly: 'Certified Organic Only',
    pricePerKg: 'Price / kg',
    availableQty: 'Available',
    harvestedOn: 'Harvested',
    location: 'Farm Location',
    makeOfferBtn: 'Submit Offer',

    // NetProfit Match
    netProfitMatch: 'NetProfit Match',
    netProfitSubtitle: 'Compares real take-home earnings by calculating transport costs, perishability loss, and handling.',
    grossRevenue: 'Gross Revenue',
    transportCost: 'Transport Logistics',
    lossDeduction: 'Transit / Perishability Loss',
    platformFee: 'Platform Fee (2%)',
    netEarnings: 'Calculated Net Profit',
    rankBadge: 'Rank',
    acceptOffer: 'Accept Offer',
    rejectOffer: 'Reject',
    offerAcceptedSuccess: 'Offer accepted! Order created and stock updated.',

    // Shared Transport
    sharedTransportTitle: 'Shared Transport Pooling',
    sharedTransportSubtitle: 'Combine deliveries with neighboring farmers heading along the same route to cut vehicle hire costs.',
    createTransportReq: 'Post Transport Request',
    origin: 'Pickup Point (Farm)',
    destination: 'Delivery Point (Mandi / City)',
    preferredDate: 'Target Date',
    quantityToTransport: 'Cargo Weight (kg)',
    matchedRoutes: 'Compatible Farmer Routes Nearby',
    matchScore: 'Proximity Score',

    // Voice Assistant
    voiceAssistant: 'Voice Assistant',
    voiceListening: 'Listening to your voice...',
    voiceSpeakPrompt: 'Ask a question or speak command...',
    voiceStop: 'Stop Listening',
    voiceTextFallback: 'Type text if microphone is unavailable',
    voiceReadSummary: 'Read NetProfit Explanation Aloud',

    // Common
    currencySymbol: '₹',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    status: 'Status',
    date: 'Date',
  },
  hi: {
    // Brand
    brandName: 'फेयरफार्म (FairFarm)',
    tagline: 'सीमांत किसानों के लिए सीधा बाजार मंच',
    subtitle: 'छोटे किसानों को बिना बिचौलियों के सीधे खुदरा विक्रेताओं, होटलों और थोक व्यापारियों से जोड़ना।',

    // Navigation
    navMarketplace: 'मंडी / बाजार',
    navDashboard: 'डैशबोर्ड',
    navMyListings: 'मेरी फसलें',
    navMyOffers: 'मेरे प्रस्ताव',
    navOrders: 'ऑर्डर',
    navTransport: 'साझा परिवहन',
    navLogin: 'लॉग इन',
    navRegister: 'पंजीकरण',
    navLogout: 'लॉग आउट',

    // Roles
    roleFarmer: 'किसान / उत्पादक',
    roleBuyer: 'सीधा खरीदार / व्यापारी',

    // Dashboard & Metrics
    totalListings: 'सक्रिय फसलें',
    pendingOffers: 'लंबित प्रस्ताव',
    totalOrders: 'कुल ऑर्डर',
    netRevenueEarned: 'कुल शुद्ध कमाई',
    createNewListing: 'नई फसल जोड़ें',
    offersAwaitingReview: 'समीक्षा हेतु प्रस्ताव',
    viewAllListings: 'सभी फसलें देखें',

    // Marketplace
    browseProduce: 'ताजा फसल बाजार',
    searchPlaceholder: 'फसल का नाम खोजें (जैसे टमाटर, बासमती चावल)...',
    filterCategory: 'सभी श्रेणियां',
    filterAll: 'सभी',
    filterVegetables: 'सब्जियां',
    filterFruits: 'फल',
    filterGrains: 'अनाज',
    filterDairy: 'डेयरी उत्पाद',
    filterSpices: 'मसाले',
    filterPulses: 'दालें',
    filterOrganicOnly: 'केवल जैविक (ऑर्गेनिक)',
    pricePerKg: 'भाव / किग्रा',
    availableQty: 'उपलब्ध मात्रा',
    harvestedOn: 'कटाई की तिथि',
    location: 'खेत का स्थान',
    makeOfferBtn: 'प्रस्ताव भेजें',

    // NetProfit Match
    netProfitMatch: 'नेटप्रॉफ़िट मैच (NetProfit Match)',
    netProfitSubtitle: 'परिवहन खर्च, रास्ते में होने वाले नुकसान और सेवा शुल्क घटाकर असली शुद्ध मुनाफे की तुलना करता है।',
    grossRevenue: 'कुल बिक्री राशि',
    transportCost: 'परिवहन लागत',
    lossDeduction: 'खराबी / पारगमन नुकसान',
    platformFee: 'मंच शुल्क (2%)',
    netEarnings: 'किसान की शुद्ध बचत',
    rankBadge: 'श्रेणी (रैंक)',
    acceptOffer: 'प्रस्ताव स्वीकारें',
    rejectOffer: 'अस्वीकार करें',
    offerAcceptedSuccess: 'प्रस्ताव स्वीकृत! ऑर्डर तैयार हुआ और उपलब्ध स्टॉक घट गया।',

    // Shared Transport
    sharedTransportTitle: 'साझा वाहन सुविधा',
    sharedTransportSubtitle: 'गाड़ी का किराया आधा करने के लिए आस-पास के किसानों के साथ एक ही दिशा में डिलीवरी साझा करें।',
    createTransportReq: 'परिवहन आवश्यकता दर्ज करें',
    origin: 'उठाव बिंदु (खेत)',
    destination: 'पहुंचाने का स्थान (मंडी / शहर)',
    preferredDate: 'वांछित तिथि',
    quantityToTransport: 'वजन (किग्रा)',
    matchedRoutes: 'पास के अनुकूल किसान मार्ग',
    matchScore: 'दूरी अनुकूलता स्कोर',

    // Voice Assistant
    voiceAssistant: 'आवाज सहायक (Voice AI)',
    voiceListening: 'आपकी आवाज सुन रहे हैं...',
    voiceSpeakPrompt: 'कुछ पूछें या निर्देश बोलें...',
    voiceStop: 'सुनना बंद करें',
    voiceTextFallback: 'यदि माइक काम न करे तो यहां टाइप करें',
    voiceReadSummary: 'मुनाफा विवरण बोलकर सुनाएं',

    // Common
    currencySymbol: '₹',
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    status: 'स्थिति',
    date: 'दिनांक',
  },
  kn: {
    // Brand
    brandName: 'ಫೇರ್ ಫಾರ್ಮ್ (FairFarm)',
    tagline: 'ಸಣ್ಣ ರೈತರಿಗೆ ನೇರ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ',
    subtitle: 'ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ಸಣ್ಣ ರೈತರನ್ನು ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು, ಹೋಟೆಲ್‌ಗಳು ಮತ್ತು ಸಗಟು ವ್ಯಾಪಾರಿಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',

    // Navigation
    navMarketplace: 'ಮಾರುಕಟ್ಟೆ (ಸಂತೆ)',
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navMyListings: 'ನನ್ನ ಬೆಳೆಗಳು',
    navMyOffers: 'ನನ್ನ ಆಫರ್‌ಗಳು',
    navOrders: 'ಆರ್ಡರ್‌ಗಳು',
    navTransport: 'ಹಂಚಿಕೆಯ ಸಾರಿಗೆ',
    navLogin: 'ಲಾಗಿನ್',
    navRegister: 'ನೋಂದಣಿ',
    navLogout: 'ಲಾಗ್‌ಔಟ್',

    // Roles
    roleFarmer: 'ರೈತ / ಬೆಳೆಗಾರ',
    roleBuyer: 'ನೇರ ಖರೀದಿದಾರ / ವ್ಯಾಪಾರಿ',

    // Dashboard & Metrics
    totalListings: 'ಸಕ್ರಿಯ ಬೆಳೆಗಳು',
    pendingOffers: 'ಬಾಕಿ ಇರುವ ಆಫರ್‌ಗಳು',
    totalOrders: 'ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು',
    netRevenueEarned: 'ಒಟ್ಟು ನಿವ್ವಳ ಆದಾಯ',
    createNewListing: 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
    offersAwaitingReview: 'ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿರುವ ಆಫರ್‌ಗಳು',
    viewAllListings: 'ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',

    // Marketplace
    browseProduce: 'ತಾಜಾ ಬೆಳೆಗಳ ಮಾರುಕಟ್ಟೆ',
    searchPlaceholder: 'ಬೆಳೆಯ ಹೆಸರನ್ನು ಹುಡುಕಿ (ಉದಾ. ಟೊಮೆಟೊ, ಬಾಸ್ಮತಿ ಅಕ್ಕಿ)...',
    filterCategory: 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು',
    filterAll: 'ಎಲ್ಲವೂ',
    filterVegetables: 'ತರಕಾರಿಗಳು',
    filterFruits: 'ಹಣ್ಣುಗಳು',
    filterGrains: 'ಧಾನ್ಯಗಳು',
    filterDairy: 'ಡೈರಿ ಉತ್ಪನ್ನಗಳು',
    filterSpices: 'ಮಸಾಲೆಗಳು',
    filterPulses: 'ಬೇಳೆಕಾಳುಗಳು',
    filterOrganicOnly: 'ಸಾವಯವ ಮಾತ್ರ',
    pricePerKg: 'ಬೆಲೆ / ಕೆಜಿ',
    availableQty: 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ',
    harvestedOn: 'ಕೊಯ್ಲು ದಿನಾಂಕ',
    location: 'ತೋಟದ ಸ್ಥಳ',
    makeOfferBtn: 'ಆಫರ್ ಸಲ್ಲಿಸಿ',

    // NetProfit Match
    netProfitMatch: 'ನೆಟ್‌ಪ್ರಾಫಿಟ್ ಮ್ಯಾಚ್ (NetProfit Match)',
    netProfitSubtitle: 'ಸಾರಿಗೆ ವೆಚ್ಚ, ಹಾಳಾಗುವ ನಷ್ಟ ಮತ್ತು ಸೇವಾ ಶುಲ್ಕವನ್ನು ಕಳೆದು ನಿಜವಾದ ನಿವ್ವಳ ಲಾಭವನ್ನು ಹೋಲಿಸುತ್ತದೆ.',
    grossRevenue: 'ಒಟ್ಟು ಮಾರಾಟ ಮೊತ್ತ',
    transportCost: 'ಸಾರಿಗೆ ವೆಚ್ಚ',
    lossDeduction: 'ಸಾಗಣೆಯಲ್ಲಿ ಹಾಳಾಗುವ ನಷ್ಟ',
    platformFee: 'ವೇದಿಕೆ ಶುಲ್ಕ (2%)',
    netEarnings: 'ರೈತನ ನಿವ್ವಳ ಲಾಭ',
    rankBadge: 'ಶ್ರೇಣಿ (ರ್ಯಾಂಕ್)',
    acceptOffer: 'ಆಫರ್ ಒಪ್ಪಿಕೊಳ್ಳಿ',
    rejectOffer: 'ತಿರಸ್ಕರಿಸಿ',
    offerAcceptedSuccess: 'ಆಫರ್ ಅಂಗೀಕರಿಸಲಾಗಿದೆ! ಆರ್ಡರ್ ಸೃಷ್ಟಿಯಾಗಿದೆ ಮತ್ತು ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ ನವೀಕರಿಸಲಾಗಿದೆ.',

    // Shared Transport
    sharedTransportTitle: 'ಹಂಚಿಕೆಯ ವಾಹನ ಸಾರಿಗೆ',
    sharedTransportSubtitle: 'ವಾಹನ ಬಾಡಿಗೆ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಒಂದೇ ಮಾರ್ಗದಲ್ಲಿ ಹೋಗುವ ನೆರೆಯ ರೈತರೊಂದಿಗೆ ಸಾಗಣೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
    createTransportReq: 'ಸಾರಿಗೆ ವಿನಂತಿ ಪೋಸ್ಟ್ ಮಾಡಿ',
    origin: 'ತೆಗೆದುಕೊಳ್ಳುವ ಸ್ಥಳ (ತೋಟ)',
    destination: 'ತಲುಪಿಸುವ ಸ್ಥಳ (ಮಂಡಿ / ನಗರ)',
    preferredDate: 'ದಿನಾಂಕ',
    quantityToTransport: 'ತೂಕ (ಕೆಜಿ)',
    matchedRoutes: 'ಹತ್ತಿರದ ಹೊಂದಾಣಿಕೆಯಾಗುವ ರೈತರ ಮಾರ್ಗಗಳು',
    matchScore: 'ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್',

    // Voice Assistant
    voiceAssistant: 'ಧ್ವನಿ ಸಹಾಯಕ (Voice AI)',
    voiceListening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    voiceSpeakPrompt: 'ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಆಜ್ಞೆಯನ್ನು ಮಾತನಾಡಿ...',
    voiceStop: 'ನಿಲ್ಲಿಸಿ',
    voiceTextFallback: 'ಮೈಕ್ ಲಭ್ಯವಿಲ್ಲದಿದ್ದರೆ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ',
    voiceReadSummary: 'ಲಾಭದ ವಿವರವನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',

    // Common
    currencySymbol: '₹',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    save: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    confirm: 'ಖಚಿತಪಡಿಸಿ',
    status: 'ಸ್ಥಿತಿ',
    date: 'ದಿನಾಂಕ',
  },
};
