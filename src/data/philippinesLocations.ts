// Minimal, representative Philippines locations dataset for cascading selects.
// TODO: Replace with a complete, up-to-date dataset of all provinces,
// cities/municipalities, and barangays in the Philippines.

export interface Barangay {
  code: string;
  name: string;
}

export interface CityMunicipality {
  code: string;
  name: string;
  barangays: Barangay[];
}

export interface Province {
  code: string;
  name: string;
  cities: CityMunicipality[];
}

export const PH_PROVINCES: Province[] = [
  {
    code: 'NCR',
    name: 'Metro Manila',
    cities: [
      {
        code: 'NCR-MNL',
        name: 'Manila',
        barangays: [
          { code: 'MNL-001', name: 'Barangay 1' },
          { code: 'MNL-002', name: 'Barangay 2' },
          { code: 'MNL-003', name: 'Barangay 3' },
        ],
      },
      {
        code: 'NCR-QC',
        name: 'Quezon City',
        barangays: [
          { code: 'QC-001', name: 'Bagumbayan' },
          { code: 'QC-002', name: 'Batasan Hills' },
          { code: 'QC-003', name: 'Commonwealth' },
        ],
      },
      {
        code: 'NCR-MKT',
        name: 'Makati',
        barangays: [
          { code: 'MKT-001', name: 'Bel-Air' },
          { code: 'MKT-002', name: 'Poblacion' },
          { code: 'MKT-003', name: 'San Lorenzo' },
        ],
      },
    ],
  },
  {
    code: 'CAV',
    name: 'Cavite',
    cities: [
      {
        code: 'CAV-DAS',
        name: 'Dasmariñas City',
        barangays: [
          { code: 'DAS-001', name: 'San Agustin' },
          { code: 'DAS-002', name: 'San Jose' },
          { code: 'DAS-003', name: 'Burol' },
        ],
      },
      {
        code: 'CAV-IMU',
        name: 'Imus City',
        barangays: [
          { code: 'IMU-001', name: 'Bucandala' },
          { code: 'IMU-002', name: 'Medicion' },
          { code: 'IMU-003', name: 'Tanzang Luma' },
        ],
      },
      {
        code: 'CAV-BAC',
        name: 'Bacoor City',
        barangays: [
          { code: 'BAC-001', name: 'Molino I' },
          { code: 'BAC-002', name: 'Molino II' },
          { code: 'BAC-003', name: 'Talaba' },
        ],
      },
    ],
  },
  {
    code: 'CEB',
    name: 'Cebu',
    cities: [
      {
        code: 'CEB-CC',
        name: 'Cebu City',
        barangays: [
          { code: 'CC-001', name: 'Guadalupe' },
          { code: 'CC-002', name: 'Lahug' },
          { code: 'CC-003', name: 'Mabolo' },
        ],
      },
      {
        code: 'CEB-LAP',
        name: 'Lapu-Lapu City',
        barangays: [
          { code: 'LAP-001', name: 'Basak' },
          { code: 'LAP-002', name: 'Pajac' },
          { code: 'LAP-003', name: 'Gun-ob' },
        ],
      },
      {
        code: 'CEB-MAN',
        name: 'Mandaue City',
        barangays: [
          { code: 'MAN-001', name: 'Subangdaku' },
          { code: 'MAN-002', name: 'Banilad' },
          { code: 'MAN-003', name: 'Tipolo' },
        ],
      },
    ],
  },
];

