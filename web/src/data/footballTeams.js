// Lista completa de times de futebol — 500+ times mundiais
const footballTeams = [
  // ═══ BRASIL - Série A ═══
  'Flamengo','Palmeiras','Corinthians','São Paulo','Santos','Grêmio','Internacional','Cruzeiro',
  'Atlético-MG','Fluminense','Vasco da Gama','Botafogo','Bahia','Fortaleza','Athletico-PR',
  'Red Bull Bragantino','Cuiabá','Goiás','Coritiba','América-MG',
  // ═══ BRASIL - Série B ═══
  'Sport','Vitória','Guarani','Ponte Preta','Avaí','Chapecoense','Criciúma','Londrina',
  'Operário-PR','Vila Nova','Tombense','Sampaio Corrêa','Novorizontino','ABC','Ituano',
  'CSA','CRB','Mirassol','Náutico','Brusque',
  // ═══ BRASIL - Outros ═══
  'Ceará','Paysandu','Remo','Santa Cruz','Portuguesa','Juventude','Figueirense',
  'Joinville','Paraná Clube','Brasiliense','São Caetano','Ipatinga','Barueri',
  'Americano','Madureira','Bangu','Volta Redonda','Ferroviária','Botafogo-SP','XV de Piracicaba',
  'Amazonas FC','Confiança','Ypiranga-RS','São José-RS','Aparecidense','Ferroviário','Treze',
  'Campinense','Botafogo-PB','América-RN','Icasa','Moto Club','Oeste','São Bento','Joinville',
  'Anápolis','Brasil de Pelotas','Caxias','Manaus FC','Jacuipense','Retrô','Sousa',
  // ═══ INGLATERRA - Premier League ═══
  'Manchester United','Manchester City','Liverpool','Chelsea','Arsenal','Tottenham',
  'Newcastle United','West Ham United','Brighton','Aston Villa','Crystal Palace','Brentford',
  'Fulham','Wolverhampton','Bournemouth','Nottingham Forest','Everton','Leicester City',
  'Leeds United','Southampton','Burnley','Sheffield United','Luton Town',
  // ═══ ESPANHA - La Liga ═══
  'Real Madrid','Barcelona','Atlético de Madrid','Sevilla','Real Sociedad','Villarreal',
  'Real Betis','Athletic Bilbao','Valencia','Osasuna','Celta de Vigo','Mallorca',
  'Girona','Rayo Vallecano','Getafe','Alavés','Cádiz','Granada','Las Palmas','Almería',
  // ═══ ITÁLIA - Serie A ═══
  'Juventus','AC Milan','Inter de Milão','Napoli','Roma','Lazio','Atalanta','Fiorentina',
  'Bologna','Torino','Monza','Udinese','Sassuolo','Empoli','Cagliari','Verona',
  'Lecce','Genoa','Frosinone','Salernitana',
  // ═══ ALEMANHA - Bundesliga ═══
  'Bayern de Munique','Borussia Dortmund','RB Leipzig','Bayer Leverkusen','Union Berlin',
  'Freiburg','Eintracht Frankfurt','Wolfsburg','Mainz 05','Borussia M.Gladbach',
  'Hoffenheim','Werder Bremen','Augsburg','Stuttgart','Heidenheim','Darmstadt 98','Colônia',
  // ═══ FRANÇA - Ligue 1 ═══
  'Paris Saint-Germain','Olympique de Marseille','Monaco','Lyon','Lille','Nice',
  'Rennes','Lens','Strasbourg','Toulouse','Montpellier','Nantes','Lorient',
  'Reims','Le Havre','Metz','Brest','Clermont Foot',
  // ═══ PORTUGAL ═══
  'Benfica','Porto','Sporting CP','Braga','Vitória de Guimarães','Gil Vicente',
  'Famalicão','Boavista','Rio Ave','Casa Pia','Arouca','Estoril','Vizela',
  'Portimonense','Chaves','Estrela da Amadora','Moreirense',
  // ═══ HOLANDA ═══
  'Ajax','PSV','Feyenoord','AZ Alkmaar','Twente','Utrecht','Vitesse','Heerenveen',
  'Go Ahead Eagles','NEC Nijmegen','Sparta Rotterdam','Fortuna Sittard','RKC Waalwijk',
  // ═══ ARGENTINA ═══
  'Boca Juniors','River Plate','Racing Club','Independiente','San Lorenzo','Vélez Sarsfield',
  'Estudiantes','Lanús','Defensa y Justicia','Argentinos Juniors','Talleres','Godoy Cruz',
  'Colón','Unión','Newell\'s Old Boys','Rosario Central','Banfield','Huracán',
  'Central Córdoba','Platense','Barracas Central','Tigre','Sarmiento','Arsenal de Sarandí',
  'Instituto','Belgrano',
  // ═══ URUGUAI ═══
  'Peñarol','Nacional','Defensor Sporting','Danubio','Wanderers','Liverpool FC (URU)',
  'Cerro Largo','Boston River','Plaza Colonia','Rentistas',
  // ═══ COLÔMBIA ═══
  'Atlético Nacional','Millonarios','América de Cali','Deportivo Cali','Junior de Barranquilla',
  'Santa Fe','Once Caldas','Deportes Tolima','Medellín','Envigado','Bucaramanga',
  // ═══ CHILE ═══
  'Colo-Colo','Universidad de Chile','Universidad Católica','Cobreloa','Unión Española',
  'Audax Italiano','O\'Higgins','Huachipato','Cobresal','Everton de Viña',
  // ═══ PARAGUAI ═══
  'Olimpia','Cerro Porteño','Libertad','Guaraní','Sol de América','Nacional (PAR)',
  'Sportivo Luqueño','General Caballero',
  // ═══ PERU ═══
  'Alianza Lima','Universitario','Sporting Cristal','Melgar','Cienciano','Sport Boys',
  'Carlos Mannucci','ADT',
  // ═══ MÉXICO ═══
  'Club América','Chivas Guadalajara','Cruz Azul','Pumas UNAM','Tigres UANL','Monterrey',
  'Santos Laguna','León','Toluca','Pachuca','Atlas','Necaxa','Puebla',
  'Querétaro','Mazatlán','Juárez','Tijuana','San Luis',
  // ═══ EUA / MLS ═══
  'LA Galaxy','Inter Miami','LAFC','New York City FC','New York Red Bulls','Atlanta United',
  'Seattle Sounders','Portland Timbers','Nashville SC','Philadelphia Union','Columbus Crew',
  'FC Cincinnati','Austin FC','Charlotte FC','St. Louis City SC',
  // ═══ TURQUIA ═══
  'Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','İstanbul Başakşehir',
  'Adana Demirspor','Konyaspor','Antalyaspor','Sivasspor','Alanyaspor','Kayserispor',
  // ═══ RÚSSIA ═══
  'Zenit','CSKA Moscou','Spartak Moscou','Lokomotiv Moscou','Dínamo Moscou','Krasnodar',
  // ═══ BÉLGICA ═══
  'Club Brugge','Anderlecht','Genk','Standard Liège','Gent','Antwerp','Union SG',
  // ═══ ESCÓCIA ═══
  'Celtic','Rangers','Aberdeen','Hearts','Hibernian','Dundee United',
  // ═══ GRÉCIA ═══
  'Olympiacos','Panathinaikos','AEK Atenas','PAOK','Aris',
  // ═══ ÁUSTRIA ═══
  'Red Bull Salzburg','Rapid Viena','Sturm Graz','Austria Viena','LASK','Wolfsberger',
  // ═══ SUÍÇA ═══
  'Young Boys','Basel','Zürich','Servette','Lugano','St. Gallen',
  // ═══ UCRÂNIA ═══
  'Shakhtar Donetsk','Dynamo Kyiv','Dnipro','Zorya Luhansk',
  // ═══ CROÁCIA ═══
  'Dinamo Zagreb','Hajduk Split','Rijeka','Osijek',
  // ═══ SÉRVIA ═══
  'Estrela Vermelha','Partizan','Vojvodina','Čukarički',
  // ═══ POLÔNIA ═══
  'Legia Varsóvia','Lech Poznań','Raków Częstochowa','Jagiellonia','Śląsk Wrocław',
  // ═══ REPÚBLICA TCHECA ═══
  'Slavia Praga','Sparta Praga','Viktoria Plzeň','Baník Ostrava',
  // ═══ ROMÊNIA ═══
  'FCSB','CFR Cluj','Rapid Bucareste','Universitatea Craiova',
  // ═══ DINAMARCA ═══
  'Copenhagen','Midtjylland','Brøndby','Nordsjælland',
  // ═══ SUÉCIA ═══
  'Malmö FF','AIK','Djurgården','Hammarby','IFK Göteborg',
  // ═══ NORUEGA ═══
  'Rosenborg','Molde','Bodø/Glimt','Viking',
  // ═══ JAPÃO ═══
  'Vissel Kobe','Yokohama F. Marinos','Urawa Red Diamonds','Kawasaki Frontale',
  'Kashima Antlers','Nagoya Grampus','FC Tokyo','Cerezo Osaka',
  // ═══ COREIA DO SUL ═══
  'Jeonbuk Hyundai','Ulsan Hyundai','Suwon Bluewings','FC Seoul','Pohang Steelers',
  // ═══ CHINA ═══
  'Shanghai Port','Beijing Guoan','Guangzhou FC','Shandong Taishan',
  // ═══ ARÁBIA SAUDITA ═══
  'Al-Hilal','Al-Nassr','Al-Ahli','Al-Ittihad','Al-Shabab','Al-Fateh','Al-Ettifaq',
  // ═══ QATAR ═══
  'Al-Sadd','Al-Duhail','Al-Rayyan','Al-Arabi',
  // ═══ EMIRADOS ═══
  'Al-Ain','Shabab Al-Ahli','Al-Wahda','Al-Jazira',
  // ═══ EGITO ═══
  'Al Ahly','Zamalek','Pyramids FC','Ismaily',
  // ═══ MARROCOS ═══
  'Wydad Casablanca','Raja Casablanca','AS FAR','Renaissance de Berkane',
  // ═══ TUNÍSIA ═══
  'Espérance de Tunis','Club Africain','Étoile du Sahel',
  // ═══ NIGÉRIA ═══
  'Enyimba','Kano Pillars','Rangers International',
  // ═══ ÁFRICA DO SUL ═══
  'Kaizer Chiefs','Orlando Pirates','Mamelodi Sundowns','SuperSport United',
  // ═══ AUSTRÁLIA ═══
  'Melbourne Victory','Sydney FC','Western Sydney','Melbourne City',
  // ═══ SELEÇÕES ═══
  'Brasil','Argentina','Alemanha','França','Espanha','Itália','Inglaterra',
  'Portugal','Holanda','Bélgica','Croácia','Uruguai','Colômbia','Chile',
  'México','EUA','Japão','Coreia do Sul','Austrália','Marrocos','Senegal',
  'Camarões','Gana','Nigéria','Egito','Tunísia','Costa Rica','Equador',
  'Paraguai','Peru','Venezuela','Bolívia',
];

export default footballTeams;
