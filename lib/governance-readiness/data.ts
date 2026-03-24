// AI Ethics & Governance Readiness Assessment Data

export type GovernanceRole =
  | 'AI Ethics Officer'
  | 'AI Governance Lead'
  | 'Responsible AI Manager'
  | 'AI Policy Analyst'
  | 'AI Risk Manager'
  | 'AI Compliance Officer'
  | 'AI Auditor';

export const GOVERNANCE_ROLES: GovernanceRole[] = [
  'AI Ethics Officer',
  'AI Governance Lead',
  'Responsible AI Manager',
  'AI Policy Analyst',
  'AI Risk Manager',
  'AI Compliance Officer',
  'AI Auditor',
];

export interface GovernanceSkillCategory {
  name: string;
  description: string;
  weight: number;
  skills: GovernanceSkill[];
}

export interface GovernanceSkill {
  name: string;
  aliases: string[];
  importance: 'essential' | 'important' | 'nice-to-have';
  learningResources: LearningResource[];
}

export interface LearningResource {
  name: string;
  type: 'course' | 'certification' | 'guide' | 'framework' | 'article';
  url: string;
  provider: string;
  isFree: boolean;
}

export const GOVERNANCE_SKILL_CATEGORIES: GovernanceSkillCategory[] = [
  {
    name: 'AI Frameworks & Principles',
    description: 'Knowledge of AI ethics frameworks, principles, and standards',
    weight: 2.0,
    skills: [
      {
        name: "Australia's AI Ethics Principles",
        aliases: [
          'ai ethics principles',
          'australian ai principles',
          'voluntary ai ethics',
          'australia ai framework',
          'eight ai principles',
          'ai ethics framework australia',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: "Australia's AI Ethics Principles",
            type: 'framework',
            url: 'https://www.industry.gov.au/publications/australias-artificial-intelligence-ethics-framework',
            provider: 'Australian Government',
            isFree: true,
          },
        ],
      },
      {
        name: 'Mandatory AI Guardrails',
        aliases: [
          'mandatory guardrails',
          'ai guardrails',
          'mandatory ai',
          'high-risk ai',
          'ai regulation australia',
          'ai safety standard',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Safe and Responsible AI in Australia',
            type: 'guide',
            url: 'https://www.industry.gov.au/publications/safe-and-responsible-ai-australia',
            provider: 'Australian Government',
            isFree: true,
          },
        ],
      },
      {
        name: 'OECD AI Principles',
        aliases: [
          'oecd ai',
          'oecd principles',
          'oecd artificial intelligence',
          'oecd recommendation',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'OECD AI Policy Observatory',
            type: 'framework',
            url: 'https://oecd.ai/',
            provider: 'OECD',
            isFree: true,
          },
        ],
      },
      {
        name: 'EU AI Act',
        aliases: [
          'eu ai act',
          'european ai regulation',
          'eu artificial intelligence act',
          'ai act',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'EU AI Act Overview',
            type: 'guide',
            url: 'https://artificialintelligenceact.eu/',
            provider: 'EU',
            isFree: true,
          },
        ],
      },
      {
        name: 'ISO/IEC 42001',
        aliases: [
          'iso 42001',
          'iec 42001',
          'ai management system',
          'iso ai standard',
          'aims',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'ISO/IEC 42001:2023',
            type: 'certification',
            url: 'https://www.iso.org/standard/81230.html',
            provider: 'ISO',
            isFree: false,
          },
        ],
      },
      {
        name: 'NIST AI Risk Management Framework',
        aliases: [
          'nist ai rmf',
          'nist ai',
          'ai risk management framework',
          'nist rmf',
          'ai rmf',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'NIST AI RMF',
            type: 'framework',
            url: 'https://www.nist.gov/artificial-intelligence/ai-risk-management-framework',
            provider: 'NIST',
            isFree: true,
          },
        ],
      },
      {
        name: 'Responsible AI',
        aliases: [
          'responsible ai',
          'responsible artificial intelligence',
          'rai',
          'ethical ai',
          'trustworthy ai',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Responsible AI Practices',
            type: 'guide',
            url: 'https://ai.google/responsibility/responsible-ai-practices/',
            provider: 'Google',
            isFree: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Technical AI Understanding',
    description: 'Understanding of AI/ML concepts relevant to governance',
    weight: 1.5,
    skills: [
      {
        name: 'Algorithmic Bias',
        aliases: [
          'algorithmic bias',
          'ai bias',
          'bias detection',
          'bias mitigation',
          'model bias',
          'fairness',
          'unfair bias',
          'discrimination',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Fairness in Machine Learning',
            type: 'course',
            url: 'https://developers.google.com/machine-learning/fairness-overview',
            provider: 'Google',
            isFree: true,
          },
        ],
      },
      {
        name: 'Explainability',
        aliases: [
          'explainability',
          'explainable ai',
          'xai',
          'interpretability',
          'model interpretability',
          'black box',
          'model transparency',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Interpretable Machine Learning',
            type: 'guide',
            url: 'https://christophm.github.io/interpretable-ml-book/',
            provider: 'Christoph Molnar',
            isFree: true,
          },
        ],
      },
      {
        name: 'Machine Learning',
        aliases: [
          'machine learning',
          'ml',
          'deep learning',
          'neural networks',
          'natural language processing',
          'nlp',
          'computer vision',
          'large language models',
          'llm',
          'generative ai',
          'gen ai',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'Machine Learning Crash Course',
            type: 'course',
            url: 'https://developers.google.com/machine-learning/crash-course',
            provider: 'Google',
            isFree: true,
          },
        ],
      },
      {
        name: 'AI Safety',
        aliases: [
          'ai safety',
          'safety testing',
          'red teaming',
          'adversarial testing',
          'model safety',
          'guardrails',
          'safety evaluation',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'AI Safety Fundamentals',
            type: 'course',
            url: 'https://aisafetyfundamentals.com/',
            provider: 'AI Safety Fundamentals',
            isFree: true,
          },
        ],
      },
      {
        name: 'Data Quality',
        aliases: [
          'data quality',
          'data governance',
          'data lineage',
          'data provenance',
          'training data',
          'data management',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'Data Management Body of Knowledge',
            type: 'guide',
            url: 'https://www.dama.org/cpages/body-of-knowledge',
            provider: 'DAMA International',
            isFree: false,
          },
        ],
      },
      {
        name: 'Model Evaluation',
        aliases: [
          'model evaluation',
          'model validation',
          'model monitoring',
          'performance monitoring',
          'model audit',
          'model testing',
          'benchmarking',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'ML Model Evaluation',
            type: 'guide',
            url: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
            provider: 'scikit-learn',
            isFree: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Risk Assessment & Management',
    description: 'Ability to identify, assess, and mitigate AI-related risks',
    weight: 2.0,
    skills: [
      {
        name: 'AI Risk Assessment',
        aliases: [
          'risk assessment',
          'ai risk',
          'risk analysis',
          'risk identification',
          'risk evaluation',
          'risk register',
          'impact assessment',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'AI Risk Management',
            type: 'framework',
            url: 'https://www.nist.gov/artificial-intelligence/ai-risk-management-framework',
            provider: 'NIST',
            isFree: true,
          },
        ],
      },
      {
        name: 'AI Impact Assessment',
        aliases: [
          'impact assessment',
          'algorithmic impact assessment',
          'aia',
          'human rights impact',
          'social impact',
          'environmental impact',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Algorithmic Impact Assessments',
            type: 'guide',
            url: 'https://ainowinstitute.org/aiareport2018.pdf',
            provider: 'AI Now Institute',
            isFree: true,
          },
        ],
      },
      {
        name: 'Risk Mitigation',
        aliases: [
          'risk mitigation',
          'risk controls',
          'risk treatment',
          'risk management framework',
          'mitigation strategies',
          'control measures',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'ISO 31000 Risk Management',
            type: 'certification',
            url: 'https://www.iso.org/iso-31000-risk-management.html',
            provider: 'ISO',
            isFree: false,
          },
        ],
      },
      {
        name: 'Human Oversight',
        aliases: [
          'human oversight',
          'human-in-the-loop',
          'hitl',
          'human review',
          'human control',
          'human intervention',
          'human supervision',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'Human-Centred AI Design',
            type: 'guide',
            url: 'https://pair.withgoogle.com/',
            provider: 'Google PAIR',
            isFree: true,
          },
        ],
      },
      {
        name: 'Incident Response',
        aliases: [
          'incident response',
          'incident management',
          'ai incident',
          'failure analysis',
          'post-mortem',
          'root cause analysis',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'AI Incident Database',
            type: 'article',
            url: 'https://incidentdatabase.ai/',
            provider: 'Partnership on AI',
            isFree: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Compliance & Regulation',
    description: 'Knowledge of legal and regulatory requirements affecting AI',
    weight: 1.5,
    skills: [
      {
        name: 'Privacy Act',
        aliases: [
          'privacy act',
          'australian privacy',
          'privacy legislation',
          'apps',
          'australian privacy principles',
          'information privacy',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Australian Privacy Principles',
            type: 'guide',
            url: 'https://www.oaic.gov.au/privacy/australian-privacy-principles',
            provider: 'OAIC',
            isFree: true,
          },
        ],
      },
      {
        name: 'Data Protection',
        aliases: [
          'data protection',
          'gdpr',
          'data privacy',
          'personal information',
          'pii',
          'personally identifiable',
          'consent',
          'data subject',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Privacy and Data Protection',
            type: 'course',
            url: 'https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies',
            provider: 'OAIC',
            isFree: true,
          },
        ],
      },
      {
        name: 'Intellectual Property',
        aliases: [
          'intellectual property',
          'ip',
          'copyright',
          'patents',
          'trade marks',
          'ip rights',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'AI and IP Rights',
            type: 'guide',
            url: 'https://www.ipaustralia.gov.au/',
            provider: 'IP Australia',
            isFree: true,
          },
        ],
      },
      {
        name: 'Transparency Requirements',
        aliases: [
          'transparency',
          'disclosure',
          'ai transparency',
          'notification',
          'ai disclosure',
          'labelling',
          'watermarking',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'Transparency in AI',
            type: 'guide',
            url: 'https://www.industry.gov.au/publications/australias-artificial-intelligence-ethics-framework',
            provider: 'Australian Government',
            isFree: true,
          },
        ],
      },
      {
        name: 'Audit & Compliance',
        aliases: [
          'audit',
          'compliance',
          'regulatory compliance',
          'governance framework',
          'assurance',
          'certification',
          'accreditation',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'AI Auditing Framework',
            type: 'guide',
            url: 'https://forhumanity.center/',
            provider: 'ForHumanity',
            isFree: true,
          },
        ],
      },
      {
        name: 'Consumer Law',
        aliases: [
          'consumer law',
          'acl',
          'australian consumer law',
          'consumer protection',
          'fair trading',
          'misleading conduct',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'ACCC Digital Platform Services',
            type: 'guide',
            url: 'https://www.accc.gov.au/',
            provider: 'ACCC',
            isFree: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Stakeholder Engagement',
    description: 'Communication and cross-functional collaboration skills',
    weight: 1.0,
    skills: [
      {
        name: 'Stakeholder Management',
        aliases: [
          'stakeholder management',
          'stakeholder engagement',
          'stakeholder communication',
          'cross-functional',
          'executive communication',
          'board reporting',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'Stakeholder Engagement in AI',
            type: 'guide',
            url: 'https://www.weforum.org/publications/responsible-use-of-technology/',
            provider: 'World Economic Forum',
            isFree: true,
          },
        ],
      },
      {
        name: 'Policy Writing',
        aliases: [
          'policy writing',
          'policy development',
          'policy design',
          'guidelines',
          'procedures',
          'standards development',
          'policy framework',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'AI Policy Design',
            type: 'course',
            url: 'https://www.coursera.org/learn/ai-policy',
            provider: 'Coursera',
            isFree: false,
          },
        ],
      },
      {
        name: 'Training & Awareness',
        aliases: [
          'training',
          'awareness',
          'education',
          'workshops',
          'capability building',
          'upskilling',
          'change management',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'AI Literacy Programs',
            type: 'guide',
            url: 'https://www.oecd-ilibrary.org/',
            provider: 'OECD',
            isFree: false,
          },
        ],
      },
      {
        name: 'Ethics Review Board',
        aliases: [
          'ethics board',
          'ethics committee',
          'review board',
          'advisory board',
          'ethics council',
          'governance committee',
          'governance board',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'Setting Up an AI Ethics Board',
            type: 'guide',
            url: 'https://www.weforum.org/',
            provider: 'World Economic Forum',
            isFree: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Implementation & Operations',
    description: 'Experience operationalising AI governance in practice',
    weight: 1.5,
    skills: [
      {
        name: 'Governance Framework Design',
        aliases: [
          'governance framework',
          'governance model',
          'governance structure',
          'operating model',
          'governance program',
          'governance strategy',
        ],
        importance: 'essential',
        learningResources: [
          {
            name: 'AI Governance in Practice',
            type: 'guide',
            url: 'https://www.weforum.org/publications/ai-governance-alliance-briefing-paper-series/',
            provider: 'World Economic Forum',
            isFree: true,
          },
        ],
      },
      {
        name: 'AI Register / Inventory',
        aliases: [
          'ai register',
          'ai inventory',
          'model inventory',
          'ai catalogue',
          'use case register',
          'algorithm register',
          'system register',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'AI System Inventories',
            type: 'guide',
            url: 'https://oecd.ai/',
            provider: 'OECD',
            isFree: true,
          },
        ],
      },
      {
        name: 'Procurement & Third-Party AI',
        aliases: [
          'procurement',
          'third-party ai',
          'vendor assessment',
          'supplier risk',
          'third party',
          'vendor due diligence',
          'outsourced ai',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'AI Procurement Guidelines',
            type: 'guide',
            url: 'https://www.weforum.org/publications/ai-procurement-in-a-box/',
            provider: 'World Economic Forum',
            isFree: true,
          },
        ],
      },
      {
        name: 'Monitoring & Reporting',
        aliases: [
          'monitoring',
          'reporting',
          'dashboards',
          'kpis',
          'metrics',
          'performance indicators',
          'governance reporting',
        ],
        importance: 'important',
        learningResources: [
          {
            name: 'AI Governance Metrics',
            type: 'guide',
            url: 'https://www.nist.gov/artificial-intelligence',
            provider: 'NIST',
            isFree: true,
          },
        ],
      },
      {
        name: 'Documentation',
        aliases: [
          'documentation',
          'model cards',
          'datasheets',
          'data sheets',
          'system documentation',
          'technical documentation',
          'model documentation',
        ],
        importance: 'nice-to-have',
        learningResources: [
          {
            name: 'Model Cards for Model Reporting',
            type: 'article',
            url: 'https://arxiv.org/abs/1810.03993',
            provider: 'Google Research',
            isFree: true,
          },
        ],
      },
    ],
  },
];

// Role-specific skill emphasis
export const ROLE_SKILL_EMPHASIS: Record<GovernanceRole, string[]> = {
  'AI Ethics Officer': [
    'responsible ai',
    'ai ethics principles',
    'algorithmic bias',
    'fairness',
    'stakeholder engagement',
    'ethics board',
    'transparency',
    'human oversight',
    'policy writing',
    'training',
  ],
  'AI Governance Lead': [
    'governance framework',
    'ai register',
    'policy writing',
    'stakeholder management',
    'compliance',
    'monitoring',
    'risk assessment',
    'reporting',
    'iso 42001',
    'mandatory guardrails',
  ],
  'Responsible AI Manager': [
    'responsible ai',
    'ai ethics principles',
    'governance framework',
    'impact assessment',
    'bias detection',
    'explainability',
    'stakeholder management',
    'training',
    'policy development',
    'monitoring',
  ],
  'AI Policy Analyst': [
    'policy writing',
    'ai ethics principles',
    'mandatory guardrails',
    'eu ai act',
    'oecd ai',
    'privacy act',
    'transparency',
    'consumer law',
    'regulatory compliance',
    'stakeholder engagement',
  ],
  'AI Risk Manager': [
    'risk assessment',
    'risk mitigation',
    'impact assessment',
    'ai risk',
    'incident response',
    'monitoring',
    'governance framework',
    'audit',
    'nist ai rmf',
    'human oversight',
  ],
  'AI Compliance Officer': [
    'compliance',
    'audit',
    'privacy act',
    'data protection',
    'mandatory guardrails',
    'transparency',
    'governance framework',
    'documentation',
    'reporting',
    'certification',
  ],
  'AI Auditor': [
    'audit',
    'model evaluation',
    'bias detection',
    'documentation',
    'compliance',
    'model validation',
    'governance framework',
    'transparency',
    'risk assessment',
    'assurance',
  ],
};

// Australia's 8 AI Ethics Principles for display
export const AUSTRALIA_AI_PRINCIPLES = [
  'Human, societal and environmental wellbeing',
  'Human-centred values',
  'Fairness',
  'Privacy protection and security',
  'Reliability and safety',
  'Transparency and explainability',
  'Contestability',
  'Accountability',
];

// Helper functions
export function getAllSkills(): GovernanceSkill[] {
  return GOVERNANCE_SKILL_CATEGORIES.flatMap((cat) => cat.skills);
}

export function getSkillByName(name: string): GovernanceSkill | undefined {
  const lower = name.toLowerCase();
  return getAllSkills().find(
    (s) =>
      s.name.toLowerCase() === lower ||
      s.aliases.some((a) => a.toLowerCase() === lower)
  );
}

export function getSkillsByCategory(categoryName: string): GovernanceSkill[] {
  const category = GOVERNANCE_SKILL_CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.skills || [];
}

// FAQ Content
export const FAQ_CONTENT = [
  {
    question: 'What is AI governance and why does it matter in Australia?',
    answer:
      "AI governance refers to the frameworks, policies, and practices that ensure AI systems are developed and used responsibly. In Australia, the government has established voluntary AI Ethics Principles and is moving towards mandatory guardrails for high-risk AI. With growing regulation globally, organisations need professionals who can navigate this landscape and ensure their AI systems are ethical, compliant, and trustworthy.",
  },
  {
    question: 'What roles exist in AI governance?',
    answer:
      "AI governance roles are growing rapidly. Common titles include AI Ethics Officer, AI Governance Lead, Responsible AI Manager, AI Policy Analyst, AI Risk Manager, AI Compliance Officer, and AI Auditor. These roles span technical understanding, policy development, risk management, and stakeholder engagement. Many professionals transition into governance from legal, compliance, data science, or policy backgrounds.",
  },
  {
    question: "What are Australia's AI Ethics Principles?",
    answer:
      "Australia's voluntary AI Ethics Framework includes eight principles: Human, societal and environmental wellbeing; Human-centred values; Fairness; Privacy protection and security; Reliability and safety; Transparency and explainability; Contestability; and Accountability. The government is also developing mandatory guardrails for high-risk AI applications.",
  },
  {
    question: 'Do I need a technical background for AI governance roles?',
    answer:
      "Not necessarily, but technical literacy helps. You don't need to build ML models, but you should understand concepts like algorithmic bias, explainability, training data quality, and how AI systems make decisions. Many successful governance professionals come from law, policy, risk management, or ethics backgrounds and build their technical understanding over time.",
  },
  {
    question: 'How does this assessment work?',
    answer:
      "Our assessment analyses your resume or experience description against six key dimensions of AI governance readiness: Framework Knowledge, Technical AI Understanding, Risk Assessment, Compliance & Regulation, Stakeholder Engagement, and Implementation Experience. All analysis happens locally in your browser — nothing is sent to our servers.",
  },
  {
    question: 'What certifications are valuable for AI governance?',
    answer:
      "Key certifications include ISO/IEC 42001 (AI Management Systems), CIPP/ANZ (privacy), and various responsible AI certifications from major tech companies. The NIST AI Risk Management Framework provides free training. Industry bodies like the International Association of Privacy Professionals (IAPP) also offer relevant programmes.",
  },
  {
    question: 'Is AI governance a growing field in Australia?',
    answer:
      "Yes, significantly. With the Australian government's push towards mandatory AI regulation, the establishment of the National AI Centre, and increasing adoption of AI across industries, demand for AI governance professionals is growing rapidly. Banks, government agencies, healthcare providers, and large enterprises are all building governance teams.",
  },
  {
    question: 'How can I transition into AI governance?',
    answer:
      "Start by understanding AI fundamentals and Australia's regulatory landscape. Build on your existing skills — if you're in law, focus on AI regulation; if in risk management, focus on AI risk frameworks; if in tech, focus on responsible AI practices. Get certified (ISO 42001, privacy qualifications), contribute to industry discussions, and look for roles that bridge your current expertise with governance needs.",
  },
];
