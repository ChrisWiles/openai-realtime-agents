/**
 * Example account information for a contractor.
 */
export const exampleAccountInfo = {
  accountId: 'KT-123456',
  companyName: 'Smith Electrical Contractors',
  contactName: 'Alex Johnson',
  phone: '+1-206-135-1246',
  email: 'alex.johnson@smithelectrical.com',
  subscription: 'Professional Plan',
  monthlySpend: '$15,420.00',
  lastInvoiceDate: '2024-05-15',
  lastPaymentDate: '2024-05-20',
  lastPaymentAmount: '$15,420.00',
  status: 'Active',
  address: {
    street: '1234 Industrial Way',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
  },
  lastMonthDetails: {
    materialCosts: '$12,500.00',
    platformFees: '$150.00',
    expeditedShipping: '$420.00',
    totalVendors: 8,
    materialRequests: 23,
    notes:
      'Higher spend due to large commercial project and expedited deliveries.',
  },
};

/**
 * Example policy documents for Kojo platform.
 */
export const examplePolicyDocs = [
  {
    id: 'ID-010',
    name: 'Vendor Onboarding Policy',
    topic: 'vendor onboarding',
    content:
      'New vendors must complete insurance verification ($1M+ general liability), provide current trade certifications, and pass credit checks. The onboarding process typically takes 3-5 business days. All vendors must maintain current licenses and insurance coverage to remain active.',
  },
  {
    id: 'ID-020',
    name: 'Material Request Policy',
    topic: 'material requests',
    content:
      'Material requests can be submitted 24/7 through the platform. Field crews can request materials by scanning QR codes, uploading photos, or manual entry. All requests require job site information, delivery timeline, and approval from purchasing department for orders over $500. Emergency requests are processed within 2 hours during business hours.',
  },
  {
    id: 'ID-030',
    name: 'Pricing and Payment Policy',
    topic: 'pricing',
    content:
      'Kojo provides real-time pricing from multiple vendors for comparison. Platform fees are 2% of transaction value with monthly caps. Volume discounts available for contractors spending over $10K monthly. Payment terms are Net 30 for established contractors, credit card for new accounts.',
  },
  {
    id: 'ID-040',
    name: 'Delivery and Logistics Policy',
    topic: 'delivery',
    content:
      'Standard delivery is 2-5 business days depending on location and material availability. Same-day and next-day delivery available in major metros for additional fees. All deliveries require job site contact and approved delivery windows. Materials are tracked from vendor to job site with real-time updates.',
  },
];

/**
 * Example store locations for vendors.
 */
export const exampleStoreLocations = [
  // NorCal Electrical Vendors
  {
    name: 'Bay Area Electrical Supply',
    address: '1234 Industrial Blvd, San Francisco, CA',
    zip_code: '94105',
    phone: '(415) 555-1001',
    trade_type: 'electrical',
    hours: 'Mon-Fri 6am-5pm, Sat 7am-3pm',
    specialties: ['conduit', 'wire', 'panels', 'fixtures'],
  },
  {
    name: 'Silicon Valley Electric',
    address: '2855 Technology Dr, Santa Clara, CA',
    zip_code: '95050',
    phone: '(408) 555-2002',
    trade_type: 'electrical',
    hours: 'Mon-Fri 6am-6pm, Sat 7am-4pm',
    specialties: ['industrial controls', 'data cable', 'lighting'],
  },
  {
    name: 'Sacramento HVAC Supply',
    address: '1801 Commerce Way, Sacramento, CA',
    zip_code: '95811',
    phone: '(916) 555-3003',
    trade_type: 'hvac',
    hours: 'Mon-Fri 6am-5pm, Sat 7am-2pm',
    specialties: ['ductwork', 'units', 'controls', 'refrigerant'],
  },
  // SoCal Vendors
  {
    name: 'LA Metro Electrical',
    address: '6801 Industrial Ave, Los Angeles, CA',
    zip_code: '90028',
    phone: '(323) 555-4004',
    trade_type: 'electrical',
    hours: 'Mon-Fri 6am-6pm, Sat 7am-4pm',
    specialties: ['commercial grade', 'emergency lighting', 'generators'],
  },
  {
    name: 'San Diego Plumbing Supply',
    address: '555 Trade Center Dr, San Diego, CA',
    zip_code: '92101',
    phone: '(619) 555-5005',
    trade_type: 'plumbing',
    hours: 'Mon-Fri 6am-5pm, Sat 7am-3pm',
    specialties: ['copper', 'PVC', 'fixtures', 'valves'],
  },
  {
    name: 'Orange County Mechanical',
    address: '670 Industrial Park Dr, Irvine, CA',
    zip_code: '92618',
    phone: '(949) 555-6006',
    trade_type: 'mechanical',
    hours: 'Mon-Fri 6am-5pm, Sat 7am-3pm',
    specialties: ['pumps', 'motors', 'drives', 'controls'],
  },
  // East Coast Vendors
  {
    name: 'NYC Electrical Contractors Supply',
    address: '350 Industrial Way, New York, NY',
    zip_code: '10118',
    phone: '(212) 555-7007',
    trade_type: 'electrical',
    hours: 'Mon-Fri 6am-6pm, Sat 7am-4pm',
    specialties: ['high-rise', 'commercial', 'emergency power'],
  },
  {
    name: 'Boston Trade Supply',
    address: '800 Harbor Dr, Boston, MA',
    zip_code: '02199',
    phone: '(617) 555-8008',
    trade_type: 'multi-trade',
    hours: 'Mon-Fri 6am-5pm, Sat 7am-3pm',
    specialties: ['electrical', 'plumbing', 'HVAC', 'general'],
  },
  {
    name: 'DC Metro Electrical',
    address: '1234 Constitution Ave, Washington, DC',
    zip_code: '20007',
    phone: '(202) 555-9009',
    trade_type: 'electrical',
    hours: 'Mon-Fri 6am-5pm, Sat 8am-2pm',
    specialties: ['government contracts', 'security systems', 'data'],
  },
  {
    name: 'Miami Construction Supply',
    address: '1601 Port Blvd, Miami, FL',
    zip_code: '33139',
    phone: '(305) 555-1010',
    trade_type: 'multi-trade',
    hours: 'Mon-Fri 6am-5pm, Sat 7am-3pm',
    specialties: ['hurricane-rated', 'marine grade', 'tropical conditions'],
  },
];
