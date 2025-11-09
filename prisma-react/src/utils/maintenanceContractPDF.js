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
            padding: 20px;
            background: white;
        }
        h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
        .section-title {
            background: #85bc26;
            color: white;
            padding: 8px;
            margin: 15px 0 8px 0;
            font-weight: bold;
            font-size: 12px;
        }
        .client-data {
            background: #f8f9fa;
            padding: 12px;
            margin: 10px 0;
            border-left: 4px solid #85bc26;
        }
        .client-data p {
            margin: 5px 0;
        }
        .price-table, .maintenance-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
        }
        .price-table th, .price-table td,
        .maintenance-table th, .maintenance-table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }
        .price-table th, .maintenance-table th {
            background-color: #85bc26;
            color: white;
            font-weight: bold;
        }
        .maintenance-table td {
            text-align: center;
            font-size: 10px;
        }
        .checkmark {
            color: #85bc26;
            font-weight: bold;
        }
        .cross {
            color: #f44336;
            font-weight: bold;
        }
        .signatures {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            border: 1px solid #ddd;
            padding: 15px;
            width: 48%;
            text-align: center;
        }
        h4 {
            margin: 12px 0 6px 0;
            font-size: 11px;
        }
        p {
            margin: 8px 0;
            text-align: justify;
        }
        ul {
            margin: 8px 0 8px 20px;
        }
        li {
            margin: 4px 0;
        }
        .footer-info {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 2px solid #85bc26;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <h2>CONTRATTO DI MANUTENZIONE IMPIANTO FOTOVOLTAICO</h2>

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

    <h4 class="section-title">1.1 Descrizione lavori inclusi per tipologia di manutenzione</h4>
    <p>La manutenzione ordinaria (preventiva), di cui al pacchetto "SERVICE BASE" consiste in:</p>
    <ul>
        <li>verifica del corretto funzionamento dell'inverter sul display (se presente) oppure sugli indicatori LED;</li>
        <li>pulizia dell'inverter;</li>
        <li>verifica del funzionamento dei dispositivi di sicurezza;</li>
        <li>verifica della presenza di rotture o fessurizzazione del vetro dei moduli;</li>
        <li>verifica dei cavi di collegamento dei moduli;</li>
        <li>verifica dello stato dei moduli fotovoltaici;</li>
        <li>verifica meccanica a campione del serraggio dei morsetti di fissaggio;</li>
        <li>verifica elettrica generale;</li>
        <li>misurazione dei valori di tensione e corrente di ogni stringa di moduli.</li>
    </ul>
    <p>A fine ispezione è previsto il rilascio di un report di intervento con evidenza delle operazioni effettuate e relativa indicazione delle eventuali anomalie riscontrate.</p>

    <p>Il servizio di manutenzione ordinaria richiesto prevede un intervento una volta all'anno.</p>

    <h3 class="section-title">2. PULIZIA IMPIANTO FOTOVOLTAICO</h3>
    <p>L'opzione "PULIZIA IMPIANTO FOTOVOLTAICO" consiste nell'intervento una tantum per il solo lavaggio dei moduli fotovoltaici di cui all'impianto oggetto del contratto.</p>

    <h3 class="section-title">3. SERVICE PLUS</h3>
    <p>L'opzione "SERVICE PLUS" pluriennale consiste in tutti i lavori inclusi nell'opzione di manutenzione ordinaria, con l'aggiunta dei seguenti servizi:</p>
    <ul>
        <li>lavaggio annuale dei moduli fotovoltaici di cui all'impianto oggetto del contratto;</li>
        <li>monitoraggio remoto mensile dell'impianto con aggiornamento firmulare.</li>
    </ul>

    <h3 class="section-title">4. Manutenzione straordinaria (correttiva)</h3>
    <p>La manutenzione straordinaria consiste in:</p>
    <ul>
        <li>interventi per ripristino rotture;</li>
        <li>interventi di migliorie sull'impianto;</li>
        <li>richieste specifiche da parte del Committente, non oggetto di manutenzione ordinaria.</li>
    </ul>

    <p>Se il materiale risultato guasto in fase di controllo è coperto da garanzia, verrà sostituito senza onere da parte della Committente ma l'intervento sul posto dovrà essere riconosciuto alla società Appaltatrice.</p>

    <p>Le attività di manutenzione straordinaria saranno riconosciute normalmente a consuntivo con l'applicazione dei seguenti prezzi:</p>
    <ul>
        <li>€ 80.00 sulla chiamata;</li>
        <li>€ 60/h a partire dalla seconda ora.</li>
    </ul>

    <p>Il cliente si impegna a riconoscere il corrispettivo al personale tecnico per il tempo dedicato al raggiungimento del sito di intervento e all'esecuzione dell'intervento di manutenzione oltre la prima ora, come riportato a listino.</p>

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

    <h4 class="section-title">1.4 Esclusioni</h4>
    <p>Sono esclusi dallo scopo del contratto:</p>
    <ul>
        <li>eventuale risanamento di difetti del solaio di copertura, anche sopraggiunti a seguito dell'installazione dell'impianto fotovoltaico;</li>
        <li>pulizia delle superfici calpestabili del solaio di copertura che ospita l'impianto fotovoltaico oggetto di intervento;</li>
        <li>ricertificazione del quadro esistente del committente secondo normative di riferimento;</li>
        <li>eventuale costo per il noleggio di mezzi di sollevamento;</li>
        <li>quanto non espressamente indicato nei lavori inclusi nell'oggetto dell'offerta di manutenzione.</li>
    </ul>

    <div class="section-title">1.5 Validità del contratto</div>
    <p>Il contratto di manutenzione ha decorrenza dalla data di stipula per ${formData.contractDuration} anno/i.</p>
    <p>Il contratto NON si intende tacitamente rinnovato alla scadenza. Il pagamento è anticipato per l'intero corrispettivo indicato.</p>

    <div class="section-title">1.6 Costi interventi straordinari</div>
    <p>Nel caso di intervento non dovuto o di intervento non in garanzia si applicano:</p>
    <ul>
        <li>Diritto di chiamata: € 80,00 I.I. (inclusa prima ora di intervento)</li>
        <li>Costo operatore dalla seconda ora: € 40,00/ora I.I.</li>
        <li>Costo per ogni operatore aggiuntivo: € 30,00/ora I.I.</li>
    </ul>


>>>>>>>


    <h4 class="section-title">Condizioni e modalità di pagamento</div>
    <p><strong>Pagamenti LISTINO:</strong> Bonifico Bancario</p>
    <p>Le attività da riconoscere saranno pagate al 100% tramite B.B. immediato previa conferma ed accettazione scritta da parte della Committente delle liste di lavoro presentate.</p>

    <h4>2.1 Pagamenti Extra o a consuntivo</h4>
    <p>Il pagamento degli importi dovuti ad attività svolte oltre quelle incluse o ancora dovute a maggiorazioni previste nell'Allegato A saranno rendicontati a fine installazione. Il cliente accetta senza riserva sin da adesso il pagamento di eventuali extra presenti nel verbale di consegna sottoscritto a fine lavori.</p>

    <h4>2.2 Modalità di pagamento</h4>
    <p><strong>Bonifico Bancario al seguente conto corrente bancario</strong><br>
    INTEST. Sole Facile SRL</p>

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

    <div class="footer-info">
        <strong>Sole Facile srl</strong> | Via Monterosa 178/E, 10155 Torino | P.Iva 09557480010 |
        solefacilesrl@gmail.com | www.solefacilesrl.com | +39 3200103380
    </div>
</body>
</html>
  `;
};
