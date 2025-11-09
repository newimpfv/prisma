# PRISMA - Pricing Reliable Intelligence System for Management and Analysis

![PRISMA Logo](https://i.imgur.com/enKOWs3.png)

## Overview

PRISMA (Pricing Reliable Intelligence System for Management and Analysis) is a comprehensive web-based tool designed for creating detailed price quotes for photovoltaic systems. This application helps solar energy professionals generate accurate estimates, track components, and produce professional documentation for clients.

## Version

Current version: 3.34

## Key Features

- **Comprehensive System Configuration**
  - Detailed roof pitch and panel configuration
  - Support for multiple roof sections with different orientations
  - Modular panel grouping within roof sections
  - Inverter and battery storage selection
  - Electric vehicle charging options

- **Detailed Component Management**
  - Pre-loaded product database with specifications and pricing
  - Support for SolAX inverters, batteries, and accessories
  - Automatic calculation of required mounting hardware

- **Automated Cost Calculation**
  - Real-time quote updates as options change
  - Labor cost estimation based on system size
  - Detailed breakdown of all component costs
  - Customizable profit margin settings

- **Energy Production Calculation**
  - Energy production estimates
  - PVGIS data integration
  - Energy savings calculation
  - Return on investment projection

- **Professional Documentation**
  - Generates detailed HTML quote documents
  - Custom client information
  - Installation renderings
  - Personalized notes and payment terms

- **Data Management**
  - Automatic saving of session data
  - Export/import functionality
  - Version compatibility management

## Getting Started

1. **Open the PRISMA Tool**
   - Load the HTML file in any modern web browser
   - No installation or server required
   - Works offline once loaded

2. **Enter Client Information**
   - Client name and installation address
   - Building specifications (height, length, roof type)

3. **Configure System Components**
   - Define roof sections and panel arrangements
   - Select inverters and optional battery storage
   - Choose additional components and accessories

4. **Customize Financial Parameters**
   - Set labor cost per kW
   - Define safety costs
   - Adjust profit margins
   - Configure VAT percentage

5. **Generate and Save Quote**
   - Preview the quote in real-time
   - Download HTML document
   - Save project data for future reference

## System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage access for saving sessions
- PDF viewer for viewing generated quotes

## Data Persistence

PRISMA uses the browser's localStorage to automatically save your work. This provides:

- Automatic session recovery
- Protection against data loss
- The ability to work on multiple quotes

You can also export quotes to .prisma files for backup or sharing with colleagues.

## Energy Production Integration

PRISMA can integrate with PVGIS (Photovoltaic Geographical Information System) data:

1. Generate a system configuration in PVGIS
2. Export the JSON data from PVGIS
3. Import the JSON into PRISMA
4. Accurate production data will be used in calculations and reports

## Customizing the Interface

The tool offers various customization options:

- Client-specific introduction text
- Custom notes for special conditions
- Upload system renderings for visual documentation
- Adjustable quote validity period

## Troubleshooting

**Issue: Data not saving automatically**
- Ensure your browser has localStorage enabled
- Check if you're in private/incognito browsing mode
- Try clearing browser cache

**Issue: Components missing or prices outdated**
- Check for newer versions of PRISMA
- Manually update component prices in the code

**Issue: Quote generation problems**
- Try clearing the cache using the "Clean Cache" button
- Ensure all required fields are completed
- Check that your browser supports Blob URLs

## For Developers

The application is built using vanilla HTML, CSS, and JavaScript. Key technical aspects:

- Component data stored in HTML select elements
- Dynamic DOM manipulation for interface elements
- Blob URLs for document generation
- Local storage API for persistence
- JSON-based file format for exports

To modify the component database, locate the relevant select elements in the HTML code and update the options with new product information.

## License

© 2025 Newimp for SoleFacile S.r.l.
All rights reserved.

## costi standard manutenzione

### <= 6 kW
pulizia di base = 250/anno + IVA
service base = 150/anno + IVA
service plus = 400/aano + IVA
monitoraggio remoto = 50/anno + IVA

### > 6 kW <= 20 kW
pulizia di base = 350/anno + IVA
service base = 250/anno + IVA
service plus = 600/aano + IVA
monitoraggio remoto = 50/anno + IVA

### > 20 kW
manuale