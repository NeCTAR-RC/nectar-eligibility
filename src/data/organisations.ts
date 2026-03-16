export interface Organisation {
  id: string;
  name: string;
}

// Order is stable — append new entries at the end of each section.
// Existing indices are used for URL state encoding (see persistence.ts).
export const organisations: Organisation[] = [
  // Adelaide Node
  { id: "university-of-adelaide", name: "University of Adelaide" },
  {
    id: "sahmri",
    name: "South Australian Health and Medical Research Institute (SAHMRI)",
  },

  // Intersect Node
  {
    id: "australian-catholic-university",
    name: "Australian Catholic University",
  },
  { id: "university-of-canberra", name: "University of Canberra" },
  { id: "deakin-university", name: "Deakin University" },
  { id: "la-trobe-university", name: "La Trobe University" },
  { id: "university-of-new-england", name: "University of New England" },
  {
    id: "university-of-new-south-wales",
    name: "University of New South Wales",
  },
  {
    id: "university-of-technology-sydney",
    name: "University of Technology Sydney",
  },
  { id: "western-sydney-university", name: "Western Sydney University" },
  { id: "sax-institute", name: "Sax Institute" },
  { id: "sirca", name: "Sirca" },

  // Melbourne Node
  { id: "university-of-melbourne", name: "University of Melbourne" },
  {
    id: "florey-institute",
    name: "The Florey Institute of Neuroscience and Mental Health",
  },
  { id: "bionics-institute", name: "Bionics Institute" },
  { id: "centre-for-eye-research", name: "Centre for Eye Research" },
  {
    id: "peter-maccallum-oncology",
    name: "Sir Peter MacCallum Department of Oncology",
  },
  {
    id: "st-vincents-hospital-melbourne",
    name: "St Vincent Hospital Melbourne",
  },
  {
    id: "wehi",
    name: "The Walter and Eliza Hall Institute of Medical Research (WEHI)",
  },
  { id: "metabolomics-australia", name: "Metabolomics Australia" },
  { id: "mcri", name: "Murdoch Children's Research Institute (MCRI)" },
  { id: "vccc", name: "Victorian Comprehensive Cancer Centre (VCCC)" },
  { id: "cancer-council-victoria", name: "Cancer Council Victoria" },
  { id: "melbourne-business-school", name: "Melbourne Business School" },

  // Monash Node
  { id: "monash-university", name: "Monash University" },

  // Pawsey Node
  {
    id: "pawsey-supercomputing",
    name: "Pawsey Supercomputing Research Centre",
  },
  { id: "curtin-university", name: "Curtin University" },
  { id: "edith-cowan-university", name: "Edith Cowan University" },
  { id: "murdoch-university", name: "Murdoch University" },
  {
    id: "university-of-western-australia",
    name: "University of Western Australia",
  },

  // QCIF Node
  { id: "bond-university", name: "Bond University" },
  {
    id: "central-queensland-university",
    name: "Central Queensland University",
  },
  { id: "griffith-university", name: "Griffith University" },
  { id: "james-cook-university", name: "James Cook University" },
  { id: "queensland-museum-network", name: "Queensland Museum Network" },
  {
    id: "queensland-university-of-technology",
    name: "Queensland University of Technology",
  },
  { id: "southern-cross-university", name: "Southern Cross University" },
  { id: "university-of-queensland", name: "University of Queensland" },
  {
    id: "university-of-the-sunshine-coast",
    name: "University of the Sunshine Coast",
  },

  // UTAS Node
  { id: "university-of-tasmania", name: "University of Tasmania" },
  { id: "aapp", name: "Australian Antarctic Program Partnership (AAPP)" },
  {
    id: "bureau-of-meteorology",
    name: "Bureau of Meteorology (BOM) Research Centre",
  },
  {
    id: "antarctic-division",
    name: "The Australian Government Antarctic Division",
  },
  {
    id: "australian-maritime-college",
    name: "The Australian Maritime College (AMC)",
  },

  // Independent Nodes
  { id: "university-of-auckland", name: "University of Auckland" },
  {
    id: "swinburne-university-of-technology",
    name: "Swinburne University of Technology",
  },

  // Unaffiliated Universities
  {
    id: "australian-national-university",
    name: "Australian National University",
  },
  { id: "charles-darwin-university", name: "Charles Darwin University" },
  { id: "charles-sturt-university", name: "Charles Sturt University" },
  { id: "csiro", name: "CSIRO" },
  {
    id: "federation-university-australia",
    name: "Federation University Australia",
  },
  { id: "macquarie-university", name: "Macquarie University" },
  { id: "rmit-university", name: "RMIT University" },
  { id: "university-of-newcastle", name: "University of Newcastle" },
  {
    id: "university-of-notre-dame",
    name: "University of Notre Dame Australia",
  },
  { id: "university-of-sydney", name: "University of Sydney" },
  { id: "university-of-wollongong", name: "University of Wollongong" },
  { id: "victoria-university", name: "Victoria University" },
];
