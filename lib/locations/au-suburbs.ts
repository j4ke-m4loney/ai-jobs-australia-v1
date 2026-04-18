/**
 * Curated list of major Australian suburbs with their state.
 *
 * Used to generate SEO landing pages at
 * /jobs/search/<keyword>-<suburb>-<state>, which 301-redirect to
 * /jobs?search=<keyword>&location=<state>.
 *
 * The composite slug "<suburb>-<state>" is what appears in the URL
 * (e.g. "richmond-vic", "richmond-nsw") — the state suffix is always
 * present so same-named suburbs across states are unambiguous.
 *
 * State values are lowercase abbreviations to match the value field
 * in AUSTRALIAN_LOCATIONS (components/ui/state-selector.tsx) — the
 * /jobs page reads ?location=<abbr> and pre-fills the state dropdown.
 */

export type AuStateAbbr = 'nsw' | 'vic' | 'qld' | 'wa' | 'sa' | 'tas' | 'act' | 'nt';

export interface AuSuburb {
  slug: string;          // kebab-case suburb slug: 'richmond', 'north-sydney'
  state: AuStateAbbr;    // lowercase state code: 'vic', 'nsw'
  displayName: string;   // human-readable: 'Richmond', 'North Sydney'
}

export const AU_SUBURBS: readonly AuSuburb[] = [
  // ────────────────────────────────────────────────────────────────
  // New South Wales (NSW)
  // ────────────────────────────────────────────────────────────────
  // Sydney CBD & inner
  { slug: 'sydney', state: 'nsw', displayName: 'Sydney' },
  { slug: 'sydney-cbd', state: 'nsw', displayName: 'Sydney CBD' },
  { slug: 'haymarket', state: 'nsw', displayName: 'Haymarket' },
  { slug: 'the-rocks', state: 'nsw', displayName: 'The Rocks' },
  { slug: 'barangaroo', state: 'nsw', displayName: 'Barangaroo' },
  { slug: 'darling-harbour', state: 'nsw', displayName: 'Darling Harbour' },
  { slug: 'circular-quay', state: 'nsw', displayName: 'Circular Quay' },
  { slug: 'pyrmont', state: 'nsw', displayName: 'Pyrmont' },
  { slug: 'ultimo', state: 'nsw', displayName: 'Ultimo' },
  { slug: 'broadway', state: 'nsw', displayName: 'Broadway' },
  { slug: 'surry-hills', state: 'nsw', displayName: 'Surry Hills' },
  { slug: 'darlinghurst', state: 'nsw', displayName: 'Darlinghurst' },
  { slug: 'paddington', state: 'nsw', displayName: 'Paddington' },
  { slug: 'potts-point', state: 'nsw', displayName: 'Potts Point' },
  { slug: 'kings-cross', state: 'nsw', displayName: 'Kings Cross' },
  { slug: 'woolloomooloo', state: 'nsw', displayName: 'Woolloomooloo' },
  { slug: 'redfern', state: 'nsw', displayName: 'Redfern' },
  { slug: 'alexandria', state: 'nsw', displayName: 'Alexandria' },
  { slug: 'waterloo', state: 'nsw', displayName: 'Waterloo' },
  { slug: 'zetland', state: 'nsw', displayName: 'Zetland' },
  { slug: 'eveleigh', state: 'nsw', displayName: 'Eveleigh' },
  { slug: 'newtown', state: 'nsw', displayName: 'Newtown' },
  { slug: 'glebe', state: 'nsw', displayName: 'Glebe' },
  { slug: 'balmain', state: 'nsw', displayName: 'Balmain' },
  { slug: 'leichhardt', state: 'nsw', displayName: 'Leichhardt' },
  { slug: 'rozelle', state: 'nsw', displayName: 'Rozelle' },
  { slug: 'mascot', state: 'nsw', displayName: 'Mascot' },
  { slug: 'rosebery', state: 'nsw', displayName: 'Rosebery' },

  // Sydney north / lower north shore
  { slug: 'north-sydney', state: 'nsw', displayName: 'North Sydney' },
  { slug: 'crows-nest', state: 'nsw', displayName: 'Crows Nest' },
  { slug: 'st-leonards', state: 'nsw', displayName: 'St Leonards' },
  { slug: 'chatswood', state: 'nsw', displayName: 'Chatswood' },
  { slug: 'lane-cove', state: 'nsw', displayName: 'Lane Cove' },
  { slug: 'north-ryde', state: 'nsw', displayName: 'North Ryde' },
  { slug: 'ryde', state: 'nsw', displayName: 'Ryde' },
  { slug: 'macquarie-park', state: 'nsw', displayName: 'Macquarie Park' },
  { slug: 'epping', state: 'nsw', displayName: 'Epping' },
  { slug: 'hornsby', state: 'nsw', displayName: 'Hornsby' },
  { slug: 'mosman', state: 'nsw', displayName: 'Mosman' },
  { slug: 'neutral-bay', state: 'nsw', displayName: 'Neutral Bay' },

  // Sydney eastern suburbs
  { slug: 'bondi', state: 'nsw', displayName: 'Bondi' },
  { slug: 'bondi-junction', state: 'nsw', displayName: 'Bondi Junction' },
  { slug: 'bondi-beach', state: 'nsw', displayName: 'Bondi Beach' },
  { slug: 'double-bay', state: 'nsw', displayName: 'Double Bay' },
  { slug: 'rose-bay', state: 'nsw', displayName: 'Rose Bay' },
  { slug: 'randwick', state: 'nsw', displayName: 'Randwick' },
  { slug: 'coogee', state: 'nsw', displayName: 'Coogee' },
  { slug: 'maroubra', state: 'nsw', displayName: 'Maroubra' },
  { slug: 'kensington', state: 'nsw', displayName: 'Kensington' },
  { slug: 'kingsford', state: 'nsw', displayName: 'Kingsford' },
  { slug: 'waverley', state: 'nsw', displayName: 'Waverley' },

  // Sydney northern beaches
  { slug: 'manly', state: 'nsw', displayName: 'Manly' },
  { slug: 'dee-why', state: 'nsw', displayName: 'Dee Why' },
  { slug: 'brookvale', state: 'nsw', displayName: 'Brookvale' },
  { slug: 'warriewood', state: 'nsw', displayName: 'Warriewood' },
  { slug: 'mona-vale', state: 'nsw', displayName: 'Mona Vale' },

  // Sydney inner west & west
  { slug: 'ashfield', state: 'nsw', displayName: 'Ashfield' },
  { slug: 'burwood', state: 'nsw', displayName: 'Burwood' },
  { slug: 'strathfield', state: 'nsw', displayName: 'Strathfield' },
  { slug: 'homebush', state: 'nsw', displayName: 'Homebush' },
  { slug: 'olympic-park', state: 'nsw', displayName: 'Sydney Olympic Park' },
  { slug: 'rhodes', state: 'nsw', displayName: 'Rhodes' },
  { slug: 'parramatta', state: 'nsw', displayName: 'Parramatta' },
  { slug: 'westmead', state: 'nsw', displayName: 'Westmead' },
  { slug: 'granville', state: 'nsw', displayName: 'Granville' },
  { slug: 'auburn', state: 'nsw', displayName: 'Auburn' },
  { slug: 'lidcombe', state: 'nsw', displayName: 'Lidcombe' },
  { slug: 'blacktown', state: 'nsw', displayName: 'Blacktown' },
  { slug: 'castle-hill', state: 'nsw', displayName: 'Castle Hill' },
  { slug: 'baulkham-hills', state: 'nsw', displayName: 'Baulkham Hills' },
  { slug: 'bella-vista', state: 'nsw', displayName: 'Bella Vista' },
  { slug: 'norwest', state: 'nsw', displayName: 'Norwest' },
  { slug: 'penrith', state: 'nsw', displayName: 'Penrith' },
  { slug: 'liverpool', state: 'nsw', displayName: 'Liverpool' },
  { slug: 'bankstown', state: 'nsw', displayName: 'Bankstown' },
  { slug: 'campbelltown', state: 'nsw', displayName: 'Campbelltown' },
  { slug: 'fairfield', state: 'nsw', displayName: 'Fairfield' },

  // Sydney south
  { slug: 'hurstville', state: 'nsw', displayName: 'Hurstville' },
  { slug: 'kogarah', state: 'nsw', displayName: 'Kogarah' },
  { slug: 'rockdale', state: 'nsw', displayName: 'Rockdale' },
  { slug: 'sutherland', state: 'nsw', displayName: 'Sutherland' },
  { slug: 'cronulla', state: 'nsw', displayName: 'Cronulla' },
  { slug: 'miranda', state: 'nsw', displayName: 'Miranda' },

  // Regional NSW
  { slug: 'newcastle', state: 'nsw', displayName: 'Newcastle' },
  { slug: 'wollongong', state: 'nsw', displayName: 'Wollongong' },
  { slug: 'central-coast', state: 'nsw', displayName: 'Central Coast' },
  { slug: 'gosford', state: 'nsw', displayName: 'Gosford' },
  { slug: 'wyong', state: 'nsw', displayName: 'Wyong' },
  { slug: 'coffs-harbour', state: 'nsw', displayName: 'Coffs Harbour' },
  { slug: 'byron-bay', state: 'nsw', displayName: 'Byron Bay' },
  { slug: 'port-macquarie', state: 'nsw', displayName: 'Port Macquarie' },
  { slug: 'tweed-heads', state: 'nsw', displayName: 'Tweed Heads' },
  { slug: 'albury', state: 'nsw', displayName: 'Albury' },
  { slug: 'wagga-wagga', state: 'nsw', displayName: 'Wagga Wagga' },
  { slug: 'dubbo', state: 'nsw', displayName: 'Dubbo' },
  { slug: 'orange', state: 'nsw', displayName: 'Orange' },
  { slug: 'bathurst', state: 'nsw', displayName: 'Bathurst' },
  { slug: 'tamworth', state: 'nsw', displayName: 'Tamworth' },
  { slug: 'armidale', state: 'nsw', displayName: 'Armidale' },
  { slug: 'lismore', state: 'nsw', displayName: 'Lismore' },
  // Richmond NSW — Hawkesbury region
  { slug: 'richmond', state: 'nsw', displayName: 'Richmond' },
  { slug: 'windsor', state: 'nsw', displayName: 'Windsor' },
  { slug: 'katoomba', state: 'nsw', displayName: 'Katoomba' },

  // ────────────────────────────────────────────────────────────────
  // Victoria (VIC)
  // ────────────────────────────────────────────────────────────────
  // Melbourne CBD & inner
  { slug: 'melbourne', state: 'vic', displayName: 'Melbourne' },
  { slug: 'melbourne-cbd', state: 'vic', displayName: 'Melbourne CBD' },
  { slug: 'southbank', state: 'vic', displayName: 'Southbank' },
  { slug: 'docklands', state: 'vic', displayName: 'Docklands' },
  { slug: 'east-melbourne', state: 'vic', displayName: 'East Melbourne' },
  { slug: 'west-melbourne', state: 'vic', displayName: 'West Melbourne' },
  { slug: 'north-melbourne', state: 'vic', displayName: 'North Melbourne' },
  { slug: 'south-melbourne', state: 'vic', displayName: 'South Melbourne' },
  { slug: 'port-melbourne', state: 'vic', displayName: 'Port Melbourne' },
  { slug: 'carlton', state: 'vic', displayName: 'Carlton' },
  { slug: 'fitzroy', state: 'vic', displayName: 'Fitzroy' },
  { slug: 'collingwood', state: 'vic', displayName: 'Collingwood' },
  { slug: 'abbotsford', state: 'vic', displayName: 'Abbotsford' },
  // Richmond VIC — inner Melbourne
  { slug: 'richmond', state: 'vic', displayName: 'Richmond' },
  { slug: 'cremorne', state: 'vic', displayName: 'Cremorne' },
  { slug: 'parkville', state: 'vic', displayName: 'Parkville' },
  { slug: 'kensington', state: 'vic', displayName: 'Kensington' },
  { slug: 'flemington', state: 'vic', displayName: 'Flemington' },
  { slug: 'prahran', state: 'vic', displayName: 'Prahran' },
  { slug: 'south-yarra', state: 'vic', displayName: 'South Yarra' },
  { slug: 'toorak', state: 'vic', displayName: 'Toorak' },
  { slug: 'windsor', state: 'vic', displayName: 'Windsor' },
  { slug: 'st-kilda', state: 'vic', displayName: 'St Kilda' },
  { slug: 'elwood', state: 'vic', displayName: 'Elwood' },
  { slug: 'albert-park', state: 'vic', displayName: 'Albert Park' },
  { slug: 'middle-park', state: 'vic', displayName: 'Middle Park' },

  // Melbourne east
  { slug: 'hawthorn', state: 'vic', displayName: 'Hawthorn' },
  { slug: 'hawthorn-east', state: 'vic', displayName: 'Hawthorn East' },
  { slug: 'kew', state: 'vic', displayName: 'Kew' },
  { slug: 'camberwell', state: 'vic', displayName: 'Camberwell' },
  { slug: 'malvern', state: 'vic', displayName: 'Malvern' },
  { slug: 'glen-iris', state: 'vic', displayName: 'Glen Iris' },
  { slug: 'box-hill', state: 'vic', displayName: 'Box Hill' },
  { slug: 'doncaster', state: 'vic', displayName: 'Doncaster' },
  { slug: 'glen-waverley', state: 'vic', displayName: 'Glen Waverley' },
  { slug: 'mount-waverley', state: 'vic', displayName: 'Mount Waverley' },
  { slug: 'clayton', state: 'vic', displayName: 'Clayton' },
  { slug: 'mulgrave', state: 'vic', displayName: 'Mulgrave' },
  { slug: 'chadstone', state: 'vic', displayName: 'Chadstone' },
  { slug: 'caulfield', state: 'vic', displayName: 'Caulfield' },
  { slug: 'elsternwick', state: 'vic', displayName: 'Elsternwick' },
  { slug: 'brighton', state: 'vic', displayName: 'Brighton' },
  { slug: 'bentleigh', state: 'vic', displayName: 'Bentleigh' },
  { slug: 'cheltenham', state: 'vic', displayName: 'Cheltenham' },
  { slug: 'mentone', state: 'vic', displayName: 'Mentone' },
  { slug: 'moorabbin', state: 'vic', displayName: 'Moorabbin' },
  { slug: 'mordialloc', state: 'vic', displayName: 'Mordialloc' },

  // Melbourne north
  { slug: 'brunswick', state: 'vic', displayName: 'Brunswick' },
  { slug: 'northcote', state: 'vic', displayName: 'Northcote' },
  { slug: 'thornbury', state: 'vic', displayName: 'Thornbury' },
  { slug: 'preston', state: 'vic', displayName: 'Preston' },
  { slug: 'coburg', state: 'vic', displayName: 'Coburg' },
  { slug: 'essendon', state: 'vic', displayName: 'Essendon' },
  { slug: 'moonee-ponds', state: 'vic', displayName: 'Moonee Ponds' },
  { slug: 'bundoora', state: 'vic', displayName: 'Bundoora' },
  { slug: 'heidelberg', state: 'vic', displayName: 'Heidelberg' },

  // Melbourne west
  { slug: 'footscray', state: 'vic', displayName: 'Footscray' },
  { slug: 'williamstown', state: 'vic', displayName: 'Williamstown' },
  { slug: 'yarraville', state: 'vic', displayName: 'Yarraville' },
  { slug: 'sunshine', state: 'vic', displayName: 'Sunshine' },
  { slug: 'werribee', state: 'vic', displayName: 'Werribee' },

  // Melbourne south east
  { slug: 'dandenong', state: 'vic', displayName: 'Dandenong' },
  { slug: 'frankston', state: 'vic', displayName: 'Frankston' },
  { slug: 'berwick', state: 'vic', displayName: 'Berwick' },
  { slug: 'narre-warren', state: 'vic', displayName: 'Narre Warren' },

  // Regional VIC
  { slug: 'geelong', state: 'vic', displayName: 'Geelong' },
  { slug: 'ballarat', state: 'vic', displayName: 'Ballarat' },
  { slug: 'bendigo', state: 'vic', displayName: 'Bendigo' },
  { slug: 'mildura', state: 'vic', displayName: 'Mildura' },
  { slug: 'shepparton', state: 'vic', displayName: 'Shepparton' },
  { slug: 'warrnambool', state: 'vic', displayName: 'Warrnambool' },
  { slug: 'traralgon', state: 'vic', displayName: 'Traralgon' },
  { slug: 'wodonga', state: 'vic', displayName: 'Wodonga' },

  // ────────────────────────────────────────────────────────────────
  // Queensland (QLD)
  // ────────────────────────────────────────────────────────────────
  // Brisbane CBD & inner
  { slug: 'brisbane', state: 'qld', displayName: 'Brisbane' },
  { slug: 'brisbane-cbd', state: 'qld', displayName: 'Brisbane CBD' },
  { slug: 'south-brisbane', state: 'qld', displayName: 'South Brisbane' },
  { slug: 'fortitude-valley', state: 'qld', displayName: 'Fortitude Valley' },
  { slug: 'new-farm', state: 'qld', displayName: 'New Farm' },
  { slug: 'west-end', state: 'qld', displayName: 'West End' },
  { slug: 'kangaroo-point', state: 'qld', displayName: 'Kangaroo Point' },
  { slug: 'teneriffe', state: 'qld', displayName: 'Teneriffe' },
  { slug: 'newstead', state: 'qld', displayName: 'Newstead' },
  { slug: 'bowen-hills', state: 'qld', displayName: 'Bowen Hills' },
  { slug: 'spring-hill', state: 'qld', displayName: 'Spring Hill' },
  { slug: 'milton', state: 'qld', displayName: 'Milton' },
  { slug: 'toowong', state: 'qld', displayName: 'Toowong' },
  { slug: 'st-lucia', state: 'qld', displayName: 'St Lucia' },
  { slug: 'indooroopilly', state: 'qld', displayName: 'Indooroopilly' },
  { slug: 'paddington', state: 'qld', displayName: 'Paddington' },

  // Brisbane north
  { slug: 'chermside', state: 'qld', displayName: 'Chermside' },
  { slug: 'nundah', state: 'qld', displayName: 'Nundah' },
  { slug: 'redcliffe', state: 'qld', displayName: 'Redcliffe' },
  { slug: 'north-lakes', state: 'qld', displayName: 'North Lakes' },

  // Brisbane south
  { slug: 'sunnybank', state: 'qld', displayName: 'Sunnybank' },
  { slug: 'mount-gravatt', state: 'qld', displayName: 'Mount Gravatt' },
  { slug: 'logan', state: 'qld', displayName: 'Logan' },
  { slug: 'springwood', state: 'qld', displayName: 'Springwood' },

  // Brisbane west / outer
  { slug: 'ipswich', state: 'qld', displayName: 'Ipswich' },
  { slug: 'springfield', state: 'qld', displayName: 'Springfield' },
  { slug: 'manly', state: 'qld', displayName: 'Manly' },

  // Gold Coast
  { slug: 'gold-coast', state: 'qld', displayName: 'Gold Coast' },
  { slug: 'surfers-paradise', state: 'qld', displayName: 'Surfers Paradise' },
  { slug: 'broadbeach', state: 'qld', displayName: 'Broadbeach' },
  { slug: 'southport', state: 'qld', displayName: 'Southport' },
  { slug: 'burleigh-heads', state: 'qld', displayName: 'Burleigh Heads' },
  { slug: 'robina', state: 'qld', displayName: 'Robina' },
  { slug: 'coolangatta', state: 'qld', displayName: 'Coolangatta' },

  // Sunshine Coast
  { slug: 'sunshine-coast', state: 'qld', displayName: 'Sunshine Coast' },
  { slug: 'maroochydore', state: 'qld', displayName: 'Maroochydore' },
  { slug: 'caloundra', state: 'qld', displayName: 'Caloundra' },
  { slug: 'noosa', state: 'qld', displayName: 'Noosa' },

  // Regional QLD
  { slug: 'cairns', state: 'qld', displayName: 'Cairns' },
  { slug: 'townsville', state: 'qld', displayName: 'Townsville' },
  { slug: 'mackay', state: 'qld', displayName: 'Mackay' },
  { slug: 'rockhampton', state: 'qld', displayName: 'Rockhampton' },
  { slug: 'bundaberg', state: 'qld', displayName: 'Bundaberg' },
  { slug: 'toowoomba', state: 'qld', displayName: 'Toowoomba' },
  { slug: 'gladstone', state: 'qld', displayName: 'Gladstone' },
  { slug: 'hervey-bay', state: 'qld', displayName: 'Hervey Bay' },

  // ────────────────────────────────────────────────────────────────
  // Western Australia (WA)
  // ────────────────────────────────────────────────────────────────
  { slug: 'perth', state: 'wa', displayName: 'Perth' },
  { slug: 'perth-cbd', state: 'wa', displayName: 'Perth CBD' },
  { slug: 'east-perth', state: 'wa', displayName: 'East Perth' },
  { slug: 'west-perth', state: 'wa', displayName: 'West Perth' },
  { slug: 'northbridge', state: 'wa', displayName: 'Northbridge' },
  { slug: 'subiaco', state: 'wa', displayName: 'Subiaco' },
  { slug: 'leederville', state: 'wa', displayName: 'Leederville' },
  { slug: 'mount-lawley', state: 'wa', displayName: 'Mount Lawley' },
  { slug: 'claremont', state: 'wa', displayName: 'Claremont' },
  { slug: 'cottesloe', state: 'wa', displayName: 'Cottesloe' },
  { slug: 'nedlands', state: 'wa', displayName: 'Nedlands' },
  { slug: 'fremantle', state: 'wa', displayName: 'Fremantle' },
  { slug: 'scarborough', state: 'wa', displayName: 'Scarborough' },
  { slug: 'joondalup', state: 'wa', displayName: 'Joondalup' },
  { slug: 'midland', state: 'wa', displayName: 'Midland' },
  { slug: 'armadale', state: 'wa', displayName: 'Armadale' },
  { slug: 'rockingham', state: 'wa', displayName: 'Rockingham' },
  { slug: 'mandurah', state: 'wa', displayName: 'Mandurah' },
  { slug: 'cannington', state: 'wa', displayName: 'Cannington' },
  { slug: 'osborne-park', state: 'wa', displayName: 'Osborne Park' },

  // Regional WA
  { slug: 'bunbury', state: 'wa', displayName: 'Bunbury' },
  { slug: 'albany', state: 'wa', displayName: 'Albany' },
  { slug: 'geraldton', state: 'wa', displayName: 'Geraldton' },
  { slug: 'kalgoorlie', state: 'wa', displayName: 'Kalgoorlie' },
  { slug: 'broome', state: 'wa', displayName: 'Broome' },
  { slug: 'karratha', state: 'wa', displayName: 'Karratha' },
  { slug: 'port-hedland', state: 'wa', displayName: 'Port Hedland' },

  // ────────────────────────────────────────────────────────────────
  // South Australia (SA)
  // ────────────────────────────────────────────────────────────────
  { slug: 'adelaide', state: 'sa', displayName: 'Adelaide' },
  { slug: 'adelaide-cbd', state: 'sa', displayName: 'Adelaide CBD' },
  { slug: 'north-adelaide', state: 'sa', displayName: 'North Adelaide' },
  { slug: 'norwood', state: 'sa', displayName: 'Norwood' },
  { slug: 'unley', state: 'sa', displayName: 'Unley' },
  { slug: 'glenelg', state: 'sa', displayName: 'Glenelg' },
  { slug: 'brighton', state: 'sa', displayName: 'Brighton' },
  { slug: 'port-adelaide', state: 'sa', displayName: 'Port Adelaide' },
  { slug: 'marion', state: 'sa', displayName: 'Marion' },
  { slug: 'modbury', state: 'sa', displayName: 'Modbury' },
  { slug: 'mount-barker', state: 'sa', displayName: 'Mount Barker' },
  { slug: 'elizabeth', state: 'sa', displayName: 'Elizabeth' },
  { slug: 'salisbury', state: 'sa', displayName: 'Salisbury' },

  // Regional SA
  { slug: 'mount-gambier', state: 'sa', displayName: 'Mount Gambier' },
  { slug: 'whyalla', state: 'sa', displayName: 'Whyalla' },
  { slug: 'port-augusta', state: 'sa', displayName: 'Port Augusta' },
  { slug: 'port-lincoln', state: 'sa', displayName: 'Port Lincoln' },

  // ────────────────────────────────────────────────────────────────
  // Tasmania (TAS)
  // ────────────────────────────────────────────────────────────────
  { slug: 'hobart', state: 'tas', displayName: 'Hobart' },
  { slug: 'hobart-cbd', state: 'tas', displayName: 'Hobart CBD' },
  { slug: 'sandy-bay', state: 'tas', displayName: 'Sandy Bay' },
  { slug: 'battery-point', state: 'tas', displayName: 'Battery Point' },
  { slug: 'north-hobart', state: 'tas', displayName: 'North Hobart' },
  { slug: 'glenorchy', state: 'tas', displayName: 'Glenorchy' },
  { slug: 'kingston', state: 'tas', displayName: 'Kingston' },
  { slug: 'rosny-park', state: 'tas', displayName: 'Rosny Park' },
  { slug: 'launceston', state: 'tas', displayName: 'Launceston' },
  { slug: 'devonport', state: 'tas', displayName: 'Devonport' },
  { slug: 'burnie', state: 'tas', displayName: 'Burnie' },

  // ────────────────────────────────────────────────────────────────
  // Australian Capital Territory (ACT)
  // ────────────────────────────────────────────────────────────────
  { slug: 'canberra', state: 'act', displayName: 'Canberra' },
  { slug: 'canberra-cbd', state: 'act', displayName: 'Canberra CBD' },
  { slug: 'civic', state: 'act', displayName: 'Civic' },
  { slug: 'barton', state: 'act', displayName: 'Barton' },
  { slug: 'kingston', state: 'act', displayName: 'Kingston' },
  { slug: 'manuka', state: 'act', displayName: 'Manuka' },
  { slug: 'braddon', state: 'act', displayName: 'Braddon' },
  { slug: 'dickson', state: 'act', displayName: 'Dickson' },
  { slug: 'fyshwick', state: 'act', displayName: 'Fyshwick' },
  { slug: 'gungahlin', state: 'act', displayName: 'Gungahlin' },
  { slug: 'belconnen', state: 'act', displayName: 'Belconnen' },
  { slug: 'woden', state: 'act', displayName: 'Woden' },
  { slug: 'tuggeranong', state: 'act', displayName: 'Tuggeranong' },
  { slug: 'russell', state: 'act', displayName: 'Russell' },

  // ────────────────────────────────────────────────────────────────
  // Northern Territory (NT)
  // ────────────────────────────────────────────────────────────────
  { slug: 'darwin', state: 'nt', displayName: 'Darwin' },
  { slug: 'darwin-cbd', state: 'nt', displayName: 'Darwin CBD' },
  { slug: 'palmerston', state: 'nt', displayName: 'Palmerston' },
  { slug: 'casuarina', state: 'nt', displayName: 'Casuarina' },
  { slug: 'nightcliff', state: 'nt', displayName: 'Nightcliff' },
  { slug: 'parap', state: 'nt', displayName: 'Parap' },
  { slug: 'alice-springs', state: 'nt', displayName: 'Alice Springs' },
  { slug: 'katherine', state: 'nt', displayName: 'Katherine' },
];

/**
 * Composite slugs "<suburb>-<state>" for fast O(1) lookup during slug parsing.
 * Example: "richmond-vic", "richmond-nsw", "parramatta-nsw".
 */
export const AU_SUBURB_COMPOSITE_SLUGS: ReadonlySet<string> = new Set(
  AU_SUBURBS.map(s => `${s.slug}-${s.state}`),
);

/**
 * Look up a suburb by its slug + state abbreviation. Returns null if the
 * combination is not in the curated list — callers should treat this as
 * "no matching SEO page for this suburb" and fall through to the default
 * behaviour (usually a redirect to /jobs).
 */
export function findSuburb(suburbSlug: string, stateAbbr: string): AuSuburb | null {
  const state = stateAbbr.toLowerCase() as AuStateAbbr;
  return (
    AU_SUBURBS.find(s => s.slug === suburbSlug && s.state === state) ?? null
  );
}

/**
 * Returns every suburb × state combo. Used by the sitemap to generate one
 * entry per keyword × suburb × state combination.
 */
export function getAllSuburbStateCombos(): readonly AuSuburb[] {
  return AU_SUBURBS;
}
