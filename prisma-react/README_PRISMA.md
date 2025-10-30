# PRISMA React - Solar Installation Pricing Calculator

A modern React application for calculating pricing quotes for solar photovoltaic installations. This is a React port of the original PRISMA HTML application.

## Features Implemented

### Core Functionality
- ✅ **Client Data Form**: Capture client name and installation address
- ✅ **Structure Data Form**: Building specifications (roof type, height, length)
- ✅ **Dynamic Roof Sections (Falde)**:
  - Add/remove multiple roof sections
  - Configure dimensions, inclination for each section
  - Nested module groups within each roof section
- ✅ **Module Groups**:
  - Multiple module groups per roof section
  - Module selection (Longi 440W, 480W, 580W models)
  - Orientation selection (vertical/horizontal)
  - Dynamic power calculations per group

### Product Data
- ✅ **Solar Modules**: 4 Longi module options with specifications
- ✅ **Inverters**: 100+ inverter models across categories:
  - Micro Inverters
  - Single Phase Inverters
  - Three Phase Inverters
  - Hybrid Inverters
  - High Power Inverters
- ✅ **Batteries**: Multiple battery types (T30, T58, HS, Rack, IES)
- ✅ **ESS Cabinets**: AELIO and TRENE cabinet options

### UI/UX
- ✅ Responsive design with Tailwind CSS
- ✅ PRISMA branding with logo
- ✅ Custom form styling matching original design
- ✅ Dynamic form sections with add/remove capabilities

## Technology Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling framework
- **Leaflet**: Map integration (ready for implementation)
- **Context API**: State management

## Project Structure

```
prisma-react/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.jsx
│   │   ├── ClientData/
│   │   │   └── ClientData.jsx
│   │   ├── StructureData/
│   │   │   └── StructureData.jsx
│   │   ├── Falde/
│   │   │   ├── Falde.jsx
│   │   │   ├── FaldaItem.jsx
│   │   │   └── GruppoModuli.jsx
│   │   ├── Components/   (To be implemented)
│   │   └── Results/      (To be implemented)
│   ├── context/
│   │   └── FormContext.jsx
│   ├── data/
│   │   ├── modules.js
│   │   ├── inverters.js
│   │   └── batteries.js
│   ├── utils/           (To be implemented)
│   ├── hooks/           (To be implemented)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+ (recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd /Users/aidvisory/Documents/Newimp/prisma/prisma-react
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to:
```
http://localhost:5173/
```

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Features To Be Implemented

### High Priority
1. **Inverter Selection Component**
   - Dynamic inverter selection with categories
   - String configuration
   - Quantity input

2. **Battery Selection Component**
   - Battery type selection
   - Quantity configuration
   - Accessory options

3. **Additional Components Section**
   - Parallel Box
   - ESS Cabinet
   - WiFi Dongle
   - MateBox
   - Meter/CT
   - EV Charger

4. **Calculation Engine**
   - Real-time price calculations
   - Material quantity calculations (rails, brackets, clamps, cables)
   - Labor cost calculations
   - Cable length calculations based on building dimensions

5. **Results Display**
   - Cost breakdown by category
   - Total system power
   - Total cost with margins
   - Material quantities summary

6. **PDF Export**
   - Generate professional quotes
   - Include all specifications
   - Cost breakdown

### Medium Priority
7. **Map Integration**
   - Leaflet map for installation location
   - Geocoding from address

8. **Data Persistence**
   - Save/load quotes
   - LocalStorage or backend integration

9. **Validation**
   - Form validation
   - Error handling
   - Input constraints

### Low Priority
10. **Advanced Features**
    - Quote comparison
    - Historical data
    - User authentication
    - Multi-language support (currently Italian)

## State Management

The application uses React Context API for state management:

- **FormContext**: Centralizes all form data
  - Client data
  - Structure data
  - Roof sections (falde)
  - Module groups
  - Inverters
  - Batteries
  - Components
  - Calculation results

## Styling

Custom CSS classes (matching original PRISMA design):
- `.form-section`: Form container styling
- `.form-group`: Individual field groups
- `.form-label`: Field labels
- `.form-input`: Text and number inputs
- `.form-select`: Select dropdowns
- `.info-text`: Helper text styling

## Development Notes

### Known Issues
- Node.js version warning (app works despite warning)
- Calculation engine not yet implemented
- Map integration pending
- PDF export pending

### Next Steps
1. Implement inverter and battery selection components
2. Port calculation logic from original HTML
3. Create results display component
4. Add form validation
5. Implement map integration
6. Add PDF export functionality

## Original Application

The original PRISMA.html application can be found in the parent directory:
```
/Users/aidvisory/Documents/Newimp/prisma/PRISMA.html
```

## Contributing

This is a conversion project from HTML to React. When adding features:
1. Maintain compatibility with original functionality
2. Use the existing component structure
3. Keep state management centralized in FormContext
4. Follow the established styling patterns

## License

[Add license information]

## Contact

[Add contact information]
