export const batteries = {
  t30: [
    { id: 't30-battery', name: 'T30 Battery - Batteria litio-ferro-fosfato T30', prezzo: 850, category: 'T30' }
  ],
  t58: [
    { id: 't58-master', name: 'T58 Master - Batteria T58 con BMS', prezzo: 1918, category: 'T58' },
    { id: 't58-slave', name: 'T58 Slave - Batteria T58 slave', prezzo: 1653, category: 'T58' }
  ],
  hs: [
    { id: 'tp-hs36', name: 'TP-HS36 - Batteria HS 3.6kWh', prezzo: 1034, category: 'HS' },
    { id: 'tp-hs25', name: 'TP-HS25 - Batteria HS 2.5kWh', prezzo: 746, category: 'HS' }
  ],
  rack: [
    { id: 'tb-hr140', name: 'TB-HR140 - Batteria Rack 14kWh', prezzo: 3174, category: 'Rack' }
  ],
  ies: [
    { id: 'tp-ld53', name: 'TP-LD53 - Batteria IES 5.3kWh Low Voltage', prezzo: 1034, category: 'IES' }
  ]
};

export const batteryAccessories = {
  rack: [
    { id: 'tbms-r15', name: 'TBMS-R15 - BMS per batteria rack', prezzo: 1323, category: 'Accessori Batterie' },
    { id: 'battery-rack-cabinet', name: 'Battery Rack Cabinet - Cabinet per 7 batterie rack', prezzo: 860, category: 'Accessori Batterie' }
  ],
  t30: [
    { id: 't30-bms', name: 'T30 BMS - BMS per batterie T30', prezzo: 507, category: 'Accessori T30' },
    { id: 'bms-parallel-box-g2-t30', name: 'BMS Parallel Box G2 T30 - Parallel Box per BMS T30', prezzo: 715, category: 'Accessori T30' },
    { id: 'accessory-pack-t30', name: 'Accessory Pack T30 - Kit accessori per batteria T30', prezzo: 159, category: 'Accessori T30' }
  ],
  t58: [
    { id: 'bms-parallel-box-ii', name: 'BMS Parallel Box II - Parallel Box per batterie T58', prezzo: 540, category: 'Accessori T58' },
    { id: 'bms-parallel-box-g2-t58', name: 'BMS Parallel Box G2 T58 - Parallel Box G2 per T58', prezzo: 688, category: 'Accessori T58' }
  ],
  hs: [
    { id: 'tbms-mcs0800', name: 'TBMS-MCS0800 - BMS per batterie HS', prezzo: 540, category: 'Accessori HS' },
    { id: 'tc-pbox70', name: 'TC-PBOX70 - Parallel Box per batterie HS', prezzo: 216, category: 'Accessori HS' }
  ],
  chargers: [
    { id: 'triple-power-charge-box', name: 'Triple Power Charge Box - Caricabatterie tripla potenza', prezzo: 1005, category: 'Carica Batterie' }
  ]
};

export const essCabinets = [
  { id: 'aelio-p50b100', name: 'AELIO-P50B100 - DC Couple BESS Cabinet 50kW 100kWh', prezzo: 52086, category: 'ESS Cabinet' },
  { id: 'aelio-p50b200', name: 'AELIO-P50B200 - DC Couple BESS Cabinet 50kW 200kWh', prezzo: 66967, category: 'ESS Cabinet' },
  { id: 'trene-p100b215-i', name: 'TRENE-P100B215-I - AC Couple BESS Cabinet 100kW 215kWh', prezzo: 81849, category: 'ESS Trene' }
];

export const getAllBatteries = () => {
  return [
    ...batteries.t30,
    ...batteries.t58,
    ...batteries.hs,
    ...batteries.rack,
    ...batteries.ies
  ];
};
