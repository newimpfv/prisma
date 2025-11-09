/**
 * Generates the HTML template for Maintenance Contract PDF
 */

export const generateContractHTML = (client, formData) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Get Italian month name
  const getItalianMonth = (dateString) => {
    const date = new Date(dateString);
    const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    return months[date.getMonth()];
  };

  const contractDate = new Date(formData.startDate || formData.contractDate);
  const serviceDescriptions = {
    'pulizia': 'Pulizia Impianto Fotovoltaico',
    'service_base': 'Manutenzione Ordinaria SERVICE BASE',
    'service_plus': 'Manutenzione Ordinaria SERVICE PLUS'
  };

  // Calculate total from dynamic priceItems array
  const priceItems = formData.priceItems || [];
  const total = priceItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: linear-gradient(135deg, #0F3460, #243b55);
            color: white;
            margin-bottom: 20px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .logo-container {
            flex: 0 0 40%;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .header-info {
            flex: 1;
            text-align: right;
            font-size: 12px;
        }
        .doc-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .doc-subtitle {
            font-size: 12px;
            opacity: 0.9;
        }
        .content-wrapper {
            padding: 0 20px 20px 20px;
        }
        h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
            page-break-after: avoid;
            break-after: avoid;
        }
        .section-title {
            background: #85bc26;
            color: white;
            padding: 8px;
            margin: 15px 0 8px 0;
            font-weight: bold;
            font-size: 12px;
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .client-data {
            background: #f8f9fa;
            padding: 12px;
            margin: 10px 0;
            border-left: 4px solid #85bc26;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .client-data p {
            margin: 5px 0;
        }
        .price-table, .maintenance-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .price-table th, .price-table td,
        .maintenance-table th, .maintenance-table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .price-table th, .maintenance-table th {
            background-color: #85bc26;
            color: white;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .maintenance-table td {
            text-align: center;
            font-size: 10px;
        }
        .checkmark {
            color: #85bc26;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .cross {
            color: #f44336;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .signatures {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .signature-box {
            border: 1px solid #ddd;
            padding: 15px;
            width: 48%;
            text-align: center;
        }
        h3 {
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        h4 {
            margin: 12px 0 6px 0;
            font-size: 11px;
            page-break-after: avoid;
            break-after: avoid;
        }
        p {
            margin: 8px 0;
            text-align: justify;
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 3;
            widows: 3;
        }
        ul {
            margin: 8px 0 8px 20px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        li {
            margin: 4px 0;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .footer-info {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: white;
            background: linear-gradient(135deg, #0F3460, #243b55);
            padding: 15px 20px;
            border-radius: 8px;
            page-break-inside: avoid;
            break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .section-content {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        /* Stili per tutti gli elementi con sfondi colorati */
        [style*="background:"],
        [style*="background-color:"],
        [style*="background: linear-gradient"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Migliora la gestione delle tabelle nella stampa */
        table {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        tbody tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        @page {
            margin: 20mm 16mm;
            size: A4;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306.71 153.03" class="logo">
                <defs><style>.cls-1{fill:#fff;}.cls-2{fill:none;}.cls-3{fill:#60b22f;}.cls-4{fill:#9cc42c;}.cls-5{fill:#bbd02c;}.cls-6{fill:#dadb1a;}.cls-7{fill:#ebe320;}</style></defs>
                <g id="Livello_2" data-name="Livello 2"><g id="Livello_1-2" data-name="Livello 1">
                    <path class="cls-1" d="M33.34,83.42A72.18,72.18,0,0,1,14.52,81,48.77,48.77,0,0,1,0,74.83L7.35,58.22a51.66,51.66,0,0,0,12.26,5.6A45.55,45.55,0,0,0,33.45,66,28.26,28.26,0,0,0,41,65.23,8.43,8.43,0,0,0,45,63a5.14,5.14,0,0,0,1.29-3.5,4.64,4.64,0,0,0-2.48-4.13,24.64,24.64,0,0,0-6.5-2.6c-2.68-.71-5.57-1.39-8.7-2a86.34,86.34,0,0,1-9.55-2.55A36.22,36.22,0,0,1,10.28,44,19.94,19.94,0,0,1,3.9,37.2,20.64,20.64,0,0,1,1.47,26.69,22.47,22.47,0,0,1,5.32,13.92Q9.15,8.16,17,4.66T36.39,1.15A67.79,67.79,0,0,1,51.71,2.9,45.12,45.12,0,0,1,65,8.16L58.2,24.66A48.24,48.24,0,0,0,47,20a41.77,41.77,0,0,0-10.74-1.47,22.49,22.49,0,0,0-7.46,1,9,9,0,0,0-4.06,2.6,5.4,5.4,0,0,0-1.24,3.39A4.75,4.75,0,0,0,26,29.8a22.51,22.51,0,0,0,6.45,2.48q3.95,1,8.75,2a96.06,96.06,0,0,1,9.55,2.53,38.78,38.78,0,0,1,8.76,4.07A20.13,20.13,0,0,1,66,47.54a19.82,19.82,0,0,1,2.49,10.34,22.46,22.46,0,0,1-3.9,12.72,26.79,26.79,0,0,1-11.7,9.32C47.7,82.26,41.17,83.42,33.34,83.42Z"/><path class="cls-1" d="M174.37,81.84V2.73h22.38V64.1h37.63V81.84Z"/><polygon class="cls-1" points="265.35 64.44 265.35 49.97 300.49 49.97 300.49 33.36 265.35 33.36 265.35 20.14 305.24 20.14 305.24 2.73 243.3 2.73 243.3 81.84 306.71 81.84 306.71 64.44 265.35 64.44"/><polygon class="cls-1" points="46.19 105.84 46.19 92.86 0 92.86 0 151.85 16.69 151.85 16.69 131.63 42.65 131.63 42.65 118.73 16.69 118.73 16.69 105.84 46.19 105.84"/><path class="cls-1" d="M95.92,151.86h17.36l-26.13-59H70.72l-26,59h17l4.63-11.55h25ZM71.24,128.09l7.57-18.86,7.57,18.86Z"/><path class="cls-1" d="M146.58,153a36.11,36.11,0,0,1-12.9-2.23,31.22,31.22,0,0,1-10.29-6.32,28.77,28.77,0,0,1-6.82-9.73,32.68,32.68,0,0,1,0-24.78,28.81,28.81,0,0,1,6.82-9.74,31.22,31.22,0,0,1,10.29-6.32,38.89,38.89,0,0,1,27.52.59,27.42,27.42,0,0,1,10.74,8.3l-10.62,9.61a20.73,20.73,0,0,0-6.32-5.14,16.37,16.37,0,0,0-7.58-1.77,18.13,18.13,0,0,0-6.66,1.18,14.4,14.4,0,0,0-5.18,3.41,16,16,0,0,0-3.37,5.35,20.05,20.05,0,0,0,0,13.83,15.88,15.88,0,0,0,3.37,5.35,14.14,14.14,0,0,0,5.18,3.41,18.13,18.13,0,0,0,6.66,1.18,16.37,16.37,0,0,0,7.58-1.77,20.32,20.32,0,0,0,6.32-5.22l10.62,9.6a27.73,27.73,0,0,1-10.74,8.35A35.68,35.68,0,0,1,146.58,153Z"/><path class="cls-1" d="M179.44,151.86v-59h16.69v59Z"/><path class="cls-1" d="M208,151.86v-59H224.7v45.76h28.07v13.24Z"/><polygon class="cls-1" points="275.86 138.88 275.86 128.09 302.07 128.09 302.07 115.7 275.86 115.7 275.86 105.84 305.61 105.84 305.61 92.86 259.42 92.86 259.42 151.85 306.71 151.85 306.71 138.88 275.86 138.88"/><path class="cls-2" d="M118.55,83.42a48.93,48.93,0,0,1-17.47-3,41,41,0,0,1-14-8.65A40,40,0,0,1,74.59,42.18,39.47,39.47,0,0,1,77.92,25.9,40.74,40.74,0,0,1,101,4.2a51.82,51.82,0,0,1,35,0A41.59,41.59,0,0,1,150,12.79a40.17,40.17,0,0,1,9.21,13,39.57,39.57,0,0,1,3.34,16.39,41.22,41.22,0,0,1-3.27,16.55A39.11,39.11,0,0,1,150,71.78a41.93,41.93,0,0,1-14,8.59A48.69,48.69,0,0,1,118.55,83.42Z"/><path class="cls-1" d="M159.79,25a40.58,40.58,0,0,0-9.35-13.19A42,42,0,0,0,136.32,3.1a52.54,52.54,0,0,0-35.56,0,41.38,41.38,0,0,0-23.46,22,40.14,40.14,0,0,0-3.38,16.52,40.82,40.82,0,0,0,3.38,16.7,41.18,41.18,0,0,0,23.52,22.08,52.37,52.37,0,0,0,35.5,0A42.71,42.71,0,0,0,150.5,71.7a39.64,39.64,0,0,0,9.35-13.25,41.55,41.55,0,0,0,3.33-16.81A40.24,40.24,0,0,0,159.79,25Z"/><path class="cls-3" d="M146,22.77c0,.81.07,1.63.07,2.46a41.07,41.07,0,0,1-3.28,16.56,39.08,39.08,0,0,1-9.21,13.05,42,42,0,0,1-14,8.59,48.76,48.76,0,0,1-17.51,3.05c-1.82,0-3.6-.09-5.34-.26-.46-.35-.92-.71-1.36-1.07a31.47,31.47,0,0,0,9.17,5.27,41.85,41.85,0,0,0,27.91,0,32.15,32.15,0,0,0,10.68-6.54,28.93,28.93,0,0,0,6.85-9.72,30.85,30.85,0,0,0,2.43-12.53A29.36,29.36,0,0,0,150,29.37,30.21,30.21,0,0,0,146,22.77Z"/><path class="cls-4" d="M102.14,66.48a48.76,48.76,0,0,0,17.51-3.05,42,42,0,0,0,14-8.59,39.08,39.08,0,0,0,9.21-13.05,41.07,41.07,0,0,0,3.28-16.56c0-.83,0-1.65-.07-2.46h0c-.4-.5-.82-1-1.25-1.46L144.5,21c-.45-.48-.91-1-1.39-1.41-.75-.7-1.52-1.36-2.33-2a30.92,30.92,0,0,0-3.87-2.51c-.66-.37-1.35-.7-2-1,.62.29,1.24.59,1.83.91,0,.29,0,.57,0,.86a41,41,0,0,1-3.27,16.55,39.25,39.25,0,0,1-9.22,13.06,42.26,42.26,0,0,1-14,8.59,48.9,48.9,0,0,1-17.51,3c-1.42,0-2.81-.05-4.19-.16-.26-.46-.52-.93-.76-1.41a30.75,30.75,0,0,0,3.17,5,28.22,28.22,0,0,0,2,2.28c.36.37.72.73,1.09,1.09h0c.43.41.88.8,1.33,1.18l.08.07c.44.36.9.72,1.36,1.07C98.54,66.39,100.32,66.48,102.14,66.48Z"/><path class="cls-5" d="M87.8,55.52c.24.48.5.95.76,1.41,1.38.11,2.77.16,4.19.16a48.9,48.9,0,0,0,17.51-3,42.26,42.26,0,0,0,14-8.59,39.25,39.25,0,0,0,9.22-13.06,41,41,0,0,0,3.27-16.55c0-.29,0-.57,0-.86-.59-.32-1.21-.62-1.83-.91l-.37-.17c-.64-.28-1.29-.56-2-.82h0c-.52-.20-1.05-.38-1.59-.56-1.08-.35-2.19-.65-3.32-.9l-.57-.11a39.52,39.52,0,0,1-3,11.49,38.91,38.91,0,0,1-9.22,13.06,42.26,42.26,0,0,1-14,8.59,48,48,0,0,1-15.72,3c0,.15,0,.31.08.47A27.85,27.85,0,0,0,87.08,54c.23.51.46,1,.71,1.49Z"/><path class="cls-6" d="M85.15,47.67a48,48,0,0,0,15.72-3,42.26,42.26,0,0,0,14-8.59A38.91,38.91,0,0,0,124.05,23a39.52,39.52,0,0,0,3-11.49h0c-.64-.13-1.29-.24-1.94-.34l-.21,0c-.58-.08-1.17-.16-1.76-.22l-.37,0c-.55-.05-1.1-.09-1.66-.12l-.46,0c-.68,0-1.38-.05-2.08-.05h0c-1,0-1.88,0-2.81.09-.32,1-.68,1.91-1.08,2.83a38.91,38.91,0,0,1-9.22,13.06,42.16,42.16,0,0,1-14,8.59,45.69,45.69,0,0,1-6.57,1.93,33.57,33.57,0,0,0-.29,4.44c0,.54,0,1.08,0,1.6s0,.85.08,1.26c0,.09,0,.17,0,.25.09,1,.22,2,.4,2.92Z"/><path class="cls-7" d="M105.44,26.68a38.91,38.91,0,0,0,9.22-13.06c.4-.92.76-1.87,1.08-2.83h0a42,42,0,0,0-5.72.74l-.15,0c-.86.18-1.69.39-2.52.62l-.4.12c-.81.24-1.61.5-2.39.79h0A30.88,30.88,0,0,0,94,19.62a29.91,29.91,0,0,0-4.8,5.83c-.42.65-.8,1.33-1.17,2s-.69,1.33-1,2-.47,1.12-.68,1.69c0,.14-.09.28-.14.42-.17.47-.32.95-.46,1.43l-.09.33a28.07,28.07,0,0,0-.78,3.84h0a45.69,45.69,0,0,0,6.57-1.93A42.16,42.16,0,0,0,105.44,26.68Z"/>
                </g></g>
            </svg>
        </div>
        <div class="header-info">
            <div class="doc-title">CONTRATTO DI MANUTENZIONE</div>
            <div class="doc-subtitle">Impianto Fotovoltaico</div>
        </div>
    </div>

    <div class="content-wrapper">

    <p>Spettabile cliente, a seguito della sua gentile richiesta siamo lieti di formulare di seguito nostra migliore offerta per <strong>PIANO DI MANUTENZIONE IMPIANTO FOTOVOLTAICO</strong>.</p>

    <div class="section-title">DATI CLIENTE</div>
    <div class="client-data">
        <p><strong>Nome:</strong> ${client.nome_first || client.nome || '_________________'}</p>
        <p><strong>Cognome:</strong> ${client.cognome || '_________________'}</p>
        <p><strong>Sito impianto:</strong> ${client.indirizzo_impianto || '_________________'}</p>
        <p><strong>Comune:</strong> ${client.citta_impianto || '_________________'}</p>
        <p><strong>Telefono:</strong> ${client.telefono || '_________________'}</p>
        <p><strong>Cellulare:</strong> ${client.cellulare || '_________________'}</p>
        <p><strong>E-mail:</strong> ${client.email || '_________________'}</p>
        <p><strong>PEC:</strong> ${client.pec || '_________________'}</p>
    </div>

    <p>L'anno ${contractDate.getFullYear()}, addì ${contractDate.getDate()} del mese di ${getItalianMonth(formData.startDate || formData.contractDate)} in Torino (TO)</p>

    <p><strong>tra</strong></p>

    <p>${client.nome || '_________________'} (CF ${client.codice_fiscale || client.cf || '_____________________'}) nato a ${client.luogo_nascita || '_______________'} il ${client.data_nascita ? formatDate(client.data_nascita) : '___/___/______'}, residente in ${client.indirizzo_residenza || client.indirizzo || '_____________________'}, di seguito denominato "Cliente"</p>

    <p><strong>e</strong></p>

    <p>la Società <strong>Sole Facile S.R.L.</strong>, con sede legale in via Monterosa 178/E, 10155, TORINO (TO), P.IVA 09557480010 e C.F. 09557480010, nella persona del suo rappresentante legale</p>

    <p>e congiuntamente indicati anche come "LE PARTI" e ciascuna di esse "LA PARTE"</p>

    <p><strong>si conviene e stipula quanto segue:</strong></p>

    <h2 class="section-title">Oggetto e descrizione dei servizi offerti</h2>

    <h3 class="section-title">1. Oggetto dell'offerta di manutenzione</h3>
    <p>La ditta Sole Facile SRL si impegna a fornire al cliente un insieme di servizi riguardanti la manutenzione ordinaria e/o straordinaria dell'impianto fotovoltaico della potenza di ${formData.power || '_____,___'} kWP, ubicato sulla/e copertura/e degli edifici nella disponibilità del cliente stesso, e precisamente siti alla ${client.indirizzo_impianto || '_____________________'}.</p>

    <div class="section-content">
        <h4 class="section-title">1.1 Descrizione lavori inclusi per tipologia di manutenzione</h4>
        <p>La manutenzione ordinaria (preventiva), di cui al pacchetto "SERVICE BASE" consiste in:</p>
        <ul>
            <li>- Verifica del corretto funzionamento dell'inverter sul display (se presente) oppure sugli indicatori LED;</li>
            <li>- Pulizia dell'inverter;</li>
            <li>- Verifica del funzionamento dei dispositivi di sicurezza;</li>
            <li>- Verifica della presenza di rotture o fessurizzazione del vetro dei moduli;</li>
            <li>- Verifica dei cavi di collegamento dei moduli;</li>
            <li>- Verifica dello stato dei moduli fotovoltaici;</li>
            <li>- Verifica meccanica a campione del serraggio dei morsetti di fissaggio;</li>
            <li>- Verifica elettrica generale;</li>
            <li>- Misurazione dei valori di tensione e corrente di ogni stringa di moduli.</li>
        </ul>
        <p>A fine ispezione è previsto il rilascio di un report di intervento con evidenza delle operazioni effettuate e relativa indicazione delle eventuali anomalie riscontrate.</p>
        <p>Il servizio di manutenzione ordinaria richiesto prevede un intervento una volta all'anno.</p>
    </div>

    <h3 class="section-title">2. PULIZIA IMPIANTO FOTOVOLTAICO</h3>
    <p>L'opzione "PULIZIA IMPIANTO FOTOVOLTAICO" consiste nell'intervento una tantum per il solo lavaggio dei moduli fotovoltaici di cui all'impianto oggetto del contratto.</p>

    <div class="section-content">
        <h3 class="section-title">3. SERVICE PLUS</h3>
        <p>L'opzione "SERVICE PLUS" pluriennale consiste in tutti i lavori inclusi nell'opzione di manutenzione ordinaria, con l'aggiunta dei seguenti servizi:</p>
        <ul>
            <li>- Lavaggio annuale dei moduli fotovoltaici di cui all'impianto oggetto del contratto;</li>
            <li>- Monitoraggio remoto mensile dell'impianto con aggiornamento firmulare.</li>
        </ul>
    </div>

    <div class="section-content">
        <h3 class="section-title">4. Manutenzione straordinaria (correttiva)</h3>
        <p>La manutenzione straordinaria consiste in:</p>
        <ul>
            <li>- Interventi per ripristino rotture;</li>
            <li>- Interventi di migliorie sull'impianto;</li>
            <li>- Richieste specifiche da parte del Committente, non oggetto di manutenzione ordinaria.</li>
        </ul>
        <p>Se il materiale risultato guasto in fase di controllo è coperto da garanzia, verrà sostituito senza onere da parte della Committente ma l'intervento sul posto dovrà essere riconosciuto alla società Appaltatrice.</p>
        <p>Le attività di manutenzione straordinaria saranno riconosciute normalmente a consuntivo con l'applicazione dei seguenti prezzi:</p>
        <ul>
            <li>- € 80.00 sulla chiamata;</li>
            <li>- € 60/h a partire dalla seconda ora.</li>
        </ul>
        <p>Il cliente si impegna a riconoscere il corrispettivo al personale tecnico per il tempo dedicato al raggiungimento del sito di intervento e all'esecuzione dell'intervento di manutenzione oltre la prima ora, come riportato a listino.</p>
    </div>

    <h4 class="section-title">1.2 Descrizione servizi inclusi per tipologia di pacchetto</h4>
    <table class="maintenance-table">
        <tr>
            <th>Descrizione intervento</th>
            <th>Frequenza</th>
            <th>PULIZIA</th>
            <th>SERVICE BASE</th>
            <th>SERVICE PLUS</th>
            <th>MONITORAGGIO REMOTO</th>
        </tr>
        <tr>
            <td>Pulizia moduli fotovoltaici</td>
            <td>annuale</td>
            <td class="checkmark">✓</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="cross">✗</td>
        </tr>
        <tr>
            <td>Verifica funzionamento inverter display/LED</td>
            <td>annuale</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
            <td class="cross">✗</td>
        </tr>
        <tr>
            <td>Pulizia inverter</td>
            <td>annuale</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
            <td class="cross">✗</td>
        </tr>
        <tr>
            <td>Verifica funzionamento dispositivi di sicurezza</td>
            <td>annuale</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
            <td class="cross">✗</td>
        </tr>
        <tr>
            <td>Verifica rotture o fessurizzazione vetro moduli</td>
            <td>annuale</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
            <td class="cross">✗</td>
        </tr>
        <tr>
            <td>Misurazione valori corrente e tensione stringhe moduli</td>
            <td>annuale</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
        </tr>
        <tr>
            <td>Monitoraggio remoto inverter</td>
            <td>mensile</td>
            <td class="cross">✗</td>
            <td class="cross">✗</td>
            <td class="checkmark">✓</td>
            <td class="checkmark">✓</td>
        </tr>
    </table>

    <h4 class="section-title">1.3 Prezzo/i</h4>
    <table class="price-table">
        <tr>
            <th>PREZZI</th>
            <th>Descrizione breve</th>
            <th>Prezzo IVA inclusa 10%</th>
        </tr>
        ${priceItems.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.description || (formData.services && formData.services[index]) || 'Servizio'}</td>
            <td>€ ${(parseFloat(item.price) || 0).toFixed(2)}</td>
        </tr>
        `).join('')}
        <tr style="background-color: #f0f0f0; font-weight: bold;">
            <td colspan="2">TOTALE</td>
            <td>€ ${total.toFixed(2)}</td>
        </tr>
    </table>

    <div class="section-content">
        <h4 class="section-title">1.4 Esclusioni</h4>
        <p>Sono esclusi dallo scopo del contratto:</p>
        <ul>
            <li>- Eventuale risanamento di difetti del solaio di copertura, anche sopraggiunti a seguito dell'installazione dell'impianto fotovoltaico;</li>
            <li>- Pulizia delle superfici calpestabili del solaio di copertura che ospita l'impianto fotovoltaico oggetto di intervento;</li>
            <li>- Ricertificazione del quadro esistente del committente secondo normative di riferimento;</li>
            <li>- Eventuale costo per il noleggio di mezzi di sollevamento;</li>
            <li>- Quanto non espressamente indicato nei lavori inclusi nell'oggetto dell'offerta di manutenzione.</li>
        </ul>
    </div>

    <div class="section-content">
        <div class="section-title">1.5 Validità del contratto</div>
        <p>Il contratto di manutenzione ha decorrenza dalla data di stipula per ${formData.contractDuration} anno/i.</p>
        <p>Il contratto NON si intende tacitamente rinnovato alla scadenza. Il pagamento è anticipato per l'intero corrispettivo indicato.</p>
    </div>

    <div class="section-content">
        <div class="section-title">1.6 Costi interventi straordinari</div>
        <p>Nel caso di intervento non dovuto o di intervento non in garanzia si applicano:</p>
        <ul>
            <li>- Diritto di chiamata: € 80,00 I.I. (inclusa prima ora di intervento)</li>
            <li>- Costo operatore dalla seconda ora: € 40,00/ora I.I.</li>
            <li>- Costo per ogni operatore aggiuntivo: € 30,00/ora I.I.</li>
        </ul>
    </div>

    <div class="section-content">
        <h4 class="section-title">Condizioni e modalità di pagamento</div>
        <p><strong>Pagamenti LISTINO:</strong> Bonifico Bancario</p>
        <p>Le attività da riconoscere saranno pagate al 100% tramite B.B. immediato previa conferma ed accettazione scritta da parte della Committente delle liste di lavoro presentate.</p>
    </div>

    <div class="section-content">
        <h4>2.1 Pagamenti Extra o a consuntivo</h4>
        <p>Il pagamento degli importi dovuti ad attività svolte oltre quelle incluse o ancora dovute a maggiorazioni previste nell'Allegato A saranno rendicontati a fine installazione. Il cliente accetta senza riserva sin da adesso il pagamento di eventuali extra presenti nel verbale di consegna sottoscritto a fine lavori.</p>
    </div>

    <div class="section-content">
        <h4>2.2 Modalità di pagamento</h4>
        <p><strong>Bonifico Bancario al seguente conto corrente bancario</strong><br>
        INTEST. Sole Facile SRL</p>
    </div>

    <div class="signatures">
        <div class="signature-box">
            <p>Torino, ${formatDate(formData.startDate || formData.contractDate)}</p>
            <br><br>
            <p><strong>Sole Facile</strong></p>
            <br><br>
            <p>_________________________________</p>
            <p>(Rappresentante Legale)</p>
        </div>
        <div class="signature-box">
            <p><strong>Per Accettazione il cliente:</strong></p>
            <br><br><br>
            <p>_________________________________</p>
            <p>(firma per esteso e leggibile)</p>
        </div>
    </div>

    <div style="margin-top: 20px; font-size: 10px;">
        <p><strong>Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c.</strong> il cliente dichiara di approvare specificatamente le norme contenute negli articoli: 1.4 (Prezzo/i), 2.1 (Pagamenti Extra o a consuntivo).</p>
        <br>
        <div style="display: flex; justify-content: space-between;">
            <div>
                <p>Torino, ${formatDate(formData.startDate || formData.contractDate)}</p>
            </div>
            <div>
                <p>Per Accettazione il cliente:</p>
                <br>
                <p>_________________________________</p>
                <p>(firma per esteso e leggibile)</p>
            </div>
        </div>
    </div>

    </div> <!-- Close content-wrapper -->

    <div class="footer-info">
        <strong>Sole Facile S.r.l.</strong> - P.IVA IT 09557480010 - Via Monterosa 178/E, 10155 Torino<br>
        Tel: +39 3200103380 | Email: solefacilesrl@gmail.com | www.solefacilesrl.com
    </div>
</body>
</html>
  `;
};
