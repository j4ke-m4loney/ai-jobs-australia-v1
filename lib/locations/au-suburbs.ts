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

  // ════════════════════════════════════════════════════════════════
  // Local Government Areas (LGAs) / Council Areas
  // ════════════════════════════════════════════════════════════════
  // Councils are a distinct search intent from suburbs — people look
  // for jobs in "City of Yarra" or "Sutherland Shire" as a geographic
  // grouping, not the individual suburbs within them. Listed here as
  // additional entries so /jobs/search/<keyword>-city-of-yarra-vic
  // resolves and redirects to the state search.
  // ────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────
  // Victoria — Metro Melbourne LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-melbourne', state: 'vic', displayName: 'City of Melbourne' },
  { slug: 'city-of-yarra', state: 'vic', displayName: 'City of Yarra' },
  { slug: 'city-of-port-phillip', state: 'vic', displayName: 'City of Port Phillip' },
  { slug: 'city-of-stonnington', state: 'vic', displayName: 'City of Stonnington' },
  { slug: 'city-of-glen-eira', state: 'vic', displayName: 'City of Glen Eira' },
  { slug: 'city-of-bayside', state: 'vic', displayName: 'City of Bayside' },
  { slug: 'city-of-kingston', state: 'vic', displayName: 'City of Kingston' },
  { slug: 'city-of-boroondara', state: 'vic', displayName: 'City of Boroondara' },
  { slug: 'city-of-whitehorse', state: 'vic', displayName: 'City of Whitehorse' },
  { slug: 'city-of-monash', state: 'vic', displayName: 'City of Monash' },
  { slug: 'city-of-knox', state: 'vic', displayName: 'City of Knox' },
  { slug: 'city-of-maroondah', state: 'vic', displayName: 'City of Maroondah' },
  { slug: 'city-of-manningham', state: 'vic', displayName: 'City of Manningham' },
  { slug: 'city-of-banyule', state: 'vic', displayName: 'City of Banyule' },
  { slug: 'city-of-darebin', state: 'vic', displayName: 'City of Darebin' },
  { slug: 'city-of-merri-bek', state: 'vic', displayName: 'City of Merri-bek' },
  { slug: 'city-of-moonee-valley', state: 'vic', displayName: 'City of Moonee Valley' },
  { slug: 'city-of-hume', state: 'vic', displayName: 'City of Hume' },
  { slug: 'city-of-whittlesea', state: 'vic', displayName: 'City of Whittlesea' },
  { slug: 'shire-of-nillumbik', state: 'vic', displayName: 'Shire of Nillumbik' },
  { slug: 'yarra-ranges-shire', state: 'vic', displayName: 'Yarra Ranges Shire' },
  { slug: 'city-of-casey', state: 'vic', displayName: 'City of Casey' },
  { slug: 'cardinia-shire', state: 'vic', displayName: 'Cardinia Shire' },
  { slug: 'city-of-greater-dandenong', state: 'vic', displayName: 'City of Greater Dandenong' },
  { slug: 'city-of-frankston', state: 'vic', displayName: 'City of Frankston' },
  { slug: 'mornington-peninsula-shire', state: 'vic', displayName: 'Mornington Peninsula Shire' },
  { slug: 'city-of-brimbank', state: 'vic', displayName: 'City of Brimbank' },
  { slug: 'city-of-hobsons-bay', state: 'vic', displayName: 'City of Hobsons Bay' },
  { slug: 'city-of-maribyrnong', state: 'vic', displayName: 'City of Maribyrnong' },
  { slug: 'city-of-melton', state: 'vic', displayName: 'City of Melton' },
  { slug: 'city-of-wyndham', state: 'vic', displayName: 'City of Wyndham' },

  // ────────────────────────────────────────────────────────────────
  // Victoria — Regional LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-greater-geelong', state: 'vic', displayName: 'City of Greater Geelong' },
  { slug: 'city-of-ballarat', state: 'vic', displayName: 'City of Ballarat' },
  { slug: 'city-of-greater-bendigo', state: 'vic', displayName: 'City of Greater Bendigo' },
  { slug: 'city-of-greater-shepparton', state: 'vic', displayName: 'City of Greater Shepparton' },
  { slug: 'city-of-warrnambool', state: 'vic', displayName: 'City of Warrnambool' },
  { slug: 'latrobe-city', state: 'vic', displayName: 'Latrobe City' },
  { slug: 'city-of-wodonga', state: 'vic', displayName: 'City of Wodonga' },
  { slug: 'mildura-rural-city', state: 'vic', displayName: 'Mildura Rural City' },
  { slug: 'surf-coast-shire', state: 'vic', displayName: 'Surf Coast Shire' },

  // ────────────────────────────────────────────────────────────────
  // New South Wales — Sydney Metro LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-sydney', state: 'nsw', displayName: 'City of Sydney' },
  { slug: 'inner-west-council', state: 'nsw', displayName: 'Inner West Council' },
  { slug: 'city-of-canada-bay', state: 'nsw', displayName: 'City of Canada Bay' },
  { slug: 'waverley-council', state: 'nsw', displayName: 'Waverley Council' },
  { slug: 'woollahra-council', state: 'nsw', displayName: 'Woollahra Council' },
  { slug: 'randwick-city', state: 'nsw', displayName: 'Randwick City' },
  { slug: 'bayside-council', state: 'nsw', displayName: 'Bayside Council' },
  { slug: 'georges-river-council', state: 'nsw', displayName: 'Georges River Council' },
  { slug: 'sutherland-shire', state: 'nsw', displayName: 'Sutherland Shire' },
  { slug: 'city-of-canterbury-bankstown', state: 'nsw', displayName: 'City of Canterbury-Bankstown' },
  { slug: 'cumberland-city', state: 'nsw', displayName: 'Cumberland City' },
  { slug: 'city-of-parramatta', state: 'nsw', displayName: 'City of Parramatta' },
  { slug: 'the-hills-shire', state: 'nsw', displayName: 'The Hills Shire' },
  { slug: 'hornsby-shire', state: 'nsw', displayName: 'Hornsby Shire' },
  { slug: 'ku-ring-gai-council', state: 'nsw', displayName: 'Ku-ring-gai Council' },
  { slug: 'city-of-willoughby', state: 'nsw', displayName: 'City of Willoughby' },
  { slug: 'north-sydney-council', state: 'nsw', displayName: 'North Sydney Council' },
  { slug: 'mosman-council', state: 'nsw', displayName: 'Mosman Council' },
  { slug: 'northern-beaches-council', state: 'nsw', displayName: 'Northern Beaches Council' },
  { slug: 'lane-cove-council', state: 'nsw', displayName: 'Lane Cove Council' },
  { slug: 'city-of-ryde', state: 'nsw', displayName: 'City of Ryde' },
  { slug: 'strathfield-council', state: 'nsw', displayName: 'Strathfield Council' },
  { slug: 'burwood-council', state: 'nsw', displayName: 'Burwood Council' },
  { slug: 'campbelltown-city', state: 'nsw', displayName: 'Campbelltown City' },
  { slug: 'camden-council', state: 'nsw', displayName: 'Camden Council' },
  { slug: 'city-of-liverpool', state: 'nsw', displayName: 'City of Liverpool' },
  { slug: 'city-of-fairfield', state: 'nsw', displayName: 'City of Fairfield' },
  { slug: 'city-of-blacktown', state: 'nsw', displayName: 'City of Blacktown' },
  { slug: 'city-of-penrith', state: 'nsw', displayName: 'City of Penrith' },
  { slug: 'hawkesbury-city', state: 'nsw', displayName: 'Hawkesbury City' },
  { slug: 'blue-mountains-city', state: 'nsw', displayName: 'Blue Mountains City' },
  { slug: 'city-of-hunters-hill', state: 'nsw', displayName: 'City of Hunters Hill' },

  // ────────────────────────────────────────────────────────────────
  // New South Wales — Regional LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-newcastle', state: 'nsw', displayName: 'City of Newcastle' },
  { slug: 'city-of-lake-macquarie', state: 'nsw', displayName: 'City of Lake Macquarie' },
  { slug: 'central-coast-council', state: 'nsw', displayName: 'Central Coast Council' },
  { slug: 'city-of-wollongong', state: 'nsw', displayName: 'City of Wollongong' },
  { slug: 'shellharbour-city', state: 'nsw', displayName: 'Shellharbour City' },
  { slug: 'kiama-municipal', state: 'nsw', displayName: 'Kiama Municipal' },
  { slug: 'shoalhaven-city', state: 'nsw', displayName: 'Shoalhaven City' },
  { slug: 'tweed-shire', state: 'nsw', displayName: 'Tweed Shire' },
  { slug: 'byron-shire', state: 'nsw', displayName: 'Byron Shire' },
  { slug: 'ballina-shire', state: 'nsw', displayName: 'Ballina Shire' },
  { slug: 'port-macquarie-hastings', state: 'nsw', displayName: 'Port Macquarie-Hastings' },
  { slug: 'coffs-harbour-city', state: 'nsw', displayName: 'Coffs Harbour City' },
  { slug: 'city-of-albury', state: 'nsw', displayName: 'City of Albury' },
  { slug: 'city-of-wagga-wagga', state: 'nsw', displayName: 'City of Wagga Wagga' },

  // ────────────────────────────────────────────────────────────────
  // Queensland — Southeast QLD LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'brisbane-city', state: 'qld', displayName: 'Brisbane City' },
  { slug: 'city-of-gold-coast', state: 'qld', displayName: 'City of Gold Coast' },
  { slug: 'city-of-logan', state: 'qld', displayName: 'City of Logan' },
  { slug: 'city-of-ipswich', state: 'qld', displayName: 'City of Ipswich' },
  { slug: 'moreton-bay-region', state: 'qld', displayName: 'Moreton Bay Region' },
  { slug: 'redland-city', state: 'qld', displayName: 'Redland City' },
  { slug: 'sunshine-coast-region', state: 'qld', displayName: 'Sunshine Coast Region' },
  { slug: 'noosa-shire', state: 'qld', displayName: 'Noosa Shire' },
  { slug: 'scenic-rim-regional', state: 'qld', displayName: 'Scenic Rim Regional' },
  { slug: 'lockyer-valley-regional', state: 'qld', displayName: 'Lockyer Valley Regional' },
  { slug: 'somerset-regional', state: 'qld', displayName: 'Somerset Regional' },

  // ────────────────────────────────────────────────────────────────
  // Queensland — Regional LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'toowoomba-regional', state: 'qld', displayName: 'Toowoomba Regional' },
  { slug: 'cairns-regional', state: 'qld', displayName: 'Cairns Regional' },
  { slug: 'townsville-city', state: 'qld', displayName: 'Townsville City' },
  { slug: 'mackay-regional', state: 'qld', displayName: 'Mackay Regional' },
  { slug: 'rockhampton-regional', state: 'qld', displayName: 'Rockhampton Regional' },
  { slug: 'gladstone-regional', state: 'qld', displayName: 'Gladstone Regional' },
  { slug: 'bundaberg-regional', state: 'qld', displayName: 'Bundaberg Regional' },
  { slug: 'fraser-coast-regional', state: 'qld', displayName: 'Fraser Coast Regional' },
  { slug: 'livingstone-shire', state: 'qld', displayName: 'Livingstone Shire' },
  { slug: 'isaac-regional', state: 'qld', displayName: 'Isaac Regional' },
  { slug: 'central-highlands-regional', state: 'qld', displayName: 'Central Highlands Regional' },
  { slug: 'whitsunday-regional', state: 'qld', displayName: 'Whitsunday Regional' },
  { slug: 'tablelands-regional', state: 'qld', displayName: 'Tablelands Regional' },
  { slug: 'douglas-shire', state: 'qld', displayName: 'Douglas Shire' },

  // ────────────────────────────────────────────────────────────────
  // Western Australia — Perth Metro LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-perth', state: 'wa', displayName: 'City of Perth' },
  { slug: 'city-of-fremantle', state: 'wa', displayName: 'City of Fremantle' },
  { slug: 'city-of-vincent', state: 'wa', displayName: 'City of Vincent' },
  { slug: 'city-of-subiaco', state: 'wa', displayName: 'City of Subiaco' },
  { slug: 'town-of-victoria-park', state: 'wa', displayName: 'Town of Victoria Park' },
  { slug: 'city-of-stirling', state: 'wa', displayName: 'City of Stirling' },
  { slug: 'town-of-cambridge', state: 'wa', displayName: 'Town of Cambridge' },
  { slug: 'city-of-nedlands', state: 'wa', displayName: 'City of Nedlands' },
  { slug: 'city-of-claremont', state: 'wa', displayName: 'City of Claremont' },
  { slug: 'town-of-cottesloe', state: 'wa', displayName: 'Town of Cottesloe' },
  { slug: 'city-of-melville', state: 'wa', displayName: 'City of Melville' },
  { slug: 'city-of-canning', state: 'wa', displayName: 'City of Canning' },
  { slug: 'city-of-gosnells', state: 'wa', displayName: 'City of Gosnells' },
  { slug: 'city-of-armadale', state: 'wa', displayName: 'City of Armadale' },
  { slug: 'city-of-rockingham', state: 'wa', displayName: 'City of Rockingham' },
  { slug: 'city-of-mandurah', state: 'wa', displayName: 'City of Mandurah' },
  { slug: 'city-of-cockburn', state: 'wa', displayName: 'City of Cockburn' },
  { slug: 'city-of-kwinana', state: 'wa', displayName: 'City of Kwinana' },
  { slug: 'city-of-joondalup', state: 'wa', displayName: 'City of Joondalup' },
  { slug: 'city-of-wanneroo', state: 'wa', displayName: 'City of Wanneroo' },
  { slug: 'city-of-swan', state: 'wa', displayName: 'City of Swan' },
  { slug: 'city-of-bayswater', state: 'wa', displayName: 'City of Bayswater' },
  { slug: 'city-of-belmont', state: 'wa', displayName: 'City of Belmont' },
  { slug: 'city-of-kalamunda', state: 'wa', displayName: 'City of Kalamunda' },

  // ────────────────────────────────────────────────────────────────
  // Western Australia — Regional LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-bunbury', state: 'wa', displayName: 'City of Bunbury' },
  { slug: 'city-of-busselton', state: 'wa', displayName: 'City of Busselton' },
  { slug: 'city-of-albany', state: 'wa', displayName: 'City of Albany' },
  { slug: 'city-of-greater-geraldton', state: 'wa', displayName: 'City of Greater Geraldton' },

  // ────────────────────────────────────────────────────────────────
  // South Australia — LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-adelaide', state: 'sa', displayName: 'City of Adelaide' },
  { slug: 'city-of-unley', state: 'sa', displayName: 'City of Unley' },
  { slug: 'city-of-burnside', state: 'sa', displayName: 'City of Burnside' },
  { slug: 'city-of-prospect', state: 'sa', displayName: 'City of Prospect' },
  { slug: 'city-of-mitcham', state: 'sa', displayName: 'City of Mitcham' },
  { slug: 'city-of-marion', state: 'sa', displayName: 'City of Marion' },
  { slug: 'city-of-holdfast-bay', state: 'sa', displayName: 'City of Holdfast Bay' },
  { slug: 'city-of-onkaparinga', state: 'sa', displayName: 'City of Onkaparinga' },
  { slug: 'city-of-tea-tree-gully', state: 'sa', displayName: 'City of Tea Tree Gully' },
  { slug: 'city-of-salisbury', state: 'sa', displayName: 'City of Salisbury' },
  { slug: 'city-of-playford', state: 'sa', displayName: 'City of Playford' },
  { slug: 'city-of-port-adelaide-enfield', state: 'sa', displayName: 'City of Port Adelaide Enfield' },
  { slug: 'city-of-west-torrens', state: 'sa', displayName: 'City of West Torrens' },
  { slug: 'city-of-charles-sturt', state: 'sa', displayName: 'City of Charles Sturt' },
  { slug: 'city-of-norwood-payneham-st-peters', state: 'sa', displayName: 'City of Norwood Payneham & St Peters' },
  { slug: 'city-of-mount-gambier', state: 'sa', displayName: 'City of Mount Gambier' },
  { slug: 'whyalla-city', state: 'sa', displayName: 'Whyalla City' },

  // ────────────────────────────────────────────────────────────────
  // Tasmania — LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-hobart', state: 'tas', displayName: 'City of Hobart' },
  { slug: 'city-of-glenorchy', state: 'tas', displayName: 'City of Glenorchy' },
  { slug: 'city-of-clarence', state: 'tas', displayName: 'City of Clarence' },
  { slug: 'kingborough-council', state: 'tas', displayName: 'Kingborough Council' },
  { slug: 'city-of-launceston', state: 'tas', displayName: 'City of Launceston' },
  { slug: 'devonport-city', state: 'tas', displayName: 'Devonport City' },
  { slug: 'burnie-city', state: 'tas', displayName: 'Burnie City' },

  // ────────────────────────────────────────────────────────────────
  // Northern Territory — LGAs
  // ────────────────────────────────────────────────────────────────
  { slug: 'city-of-darwin', state: 'nt', displayName: 'City of Darwin' },
  { slug: 'city-of-palmerston', state: 'nt', displayName: 'City of Palmerston' },

  // ────────────────────────────────────────────────────────────────
  // Legacy slug recovery — suburbs appearing in GSC "Not found (404)"
  // reports that weren't in the curated list. Each resolves to its
  // parent state via resolveSuburbSlugToState so crawled URLs stop
  // 404ing and the historical link equity flows to the state page.
  // ────────────────────────────────────────────────────────────────
  { slug: 'woollahra', state: 'nsw', displayName: 'Woollahra' },
  { slug: 'newcastle-and-maitland', state: 'nsw', displayName: 'Newcastle and Maitland' },
  { slug: 'carlton-north', state: 'vic', displayName: 'Carlton North' },
  { slug: 'knoxfield', state: 'vic', displayName: 'Knoxfield' },
  { slug: 'footscray-park', state: 'vic', displayName: 'Footscray Park' },
  { slug: 'ballarat-central', state: 'vic', displayName: 'Ballarat Central' },
  { slug: 'cairns-region', state: 'qld', displayName: 'Cairns Region' },
  { slug: 'cannon-hill', state: 'qld', displayName: 'Cannon Hill' },
  { slug: 'murarrie', state: 'qld', displayName: 'Murarrie' },
  { slug: 'bentley', state: 'wa', displayName: 'Bentley' },
  { slug: 'murdoch', state: 'wa', displayName: 'Murdoch' },
  { slug: 'edinburgh', state: 'sa', displayName: 'Edinburgh' },
  { slug: 'conder', state: 'act', displayName: 'Conder' },
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

/**
 * Look up a suburb's state by slug alone.
 *
 * Used by the legacy location-slug fallback to recover 404s for URLs Google
 * indexed before we consolidated small suburbs into their parent state (e.g.
 * /jobs/location/cremorne-vic or /jobs/location/carlton-north). If the slug
 * includes an explicit state suffix we use it; otherwise we pick the first
 * matching suburb in AU_SUBURBS (ambiguous same-named suburbs resolve to
 * whichever entry appears first, which in practice is the most prominent one).
 *
 * Returns null if no match — caller should fall back to a generic redirect.
 */
export function resolveSuburbSlugToState(slug: string): AuStateAbbr | null {
  if (!slug) return null;

  const suffixMatch = slug.match(/^(.*)-(nsw|vic|qld|wa|sa|tas|act|nt)$/);
  if (suffixMatch) {
    const [, suburbPart, stateAbbr] = suffixMatch;
    const state = stateAbbr as AuStateAbbr;
    const found = AU_SUBURBS.find(s => s.slug === suburbPart && s.state === state);
    if (found) return found.state;
  }

  const found = AU_SUBURBS.find(s => s.slug === slug);
  return found?.state ?? null;
}
