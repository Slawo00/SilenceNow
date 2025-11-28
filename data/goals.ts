export interface AITool {
  name: string;
  description: string;
  category: string;
  link?: string;
  logo?: string;
  url?: string;
}

export interface Lever {
  id: string;
  title: string;
  shortDescription: string;
  implementationGuide: string[];
  benefits: string[];
  aiTools: AITool[];
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  priority?: 'high' | 'medium' | 'low';
  responsibleRoles?: string[];
  keyKPIs?: string[];
  challengesRisks?: string[];
  practicalExamples?: string[];
  technologyRequirements?: string[];
  changeManagement?: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  levers: Lever[];
}

export const goals: Goal[] = [
  {
    id: 'speed',
    title: 'Speed (Fast Close)',
    description: 'Accelerate your month-end close process with proven strategies and automation',
    icon: 'bolt.fill',
    color: '#00D4AA',
    levers: [
      {
        id: 'speed-1',
        title: 'Automated Account Reconciliation',
        shortDescription: 'Eliminate manual reconciliation processes through AI-powered automation',
        implementationGuide: [
          'Analyze current manual reconciliation processes',
          'Identify recurring patterns and rules',
          'Implement rule-based automation for standard cases',
          'Configure AI for exception detection',
          'Establish escalation processes for special cases',
        ],
        benefits: ['60% time savings', 'Reduced error rate', 'Faster close cycles'],
        aiTools: [
          { name: 'BlackLine', description: 'Automated account reconciliation', category: 'Reconciliation' },
          { name: 'ReconArt', description: 'AI-powered matching engine', category: 'Reconciliation' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'speed-2',
        title: 'Parallel Close Processes',
        shortDescription: 'Transform sequential workflows into parallel execution',
        implementationGuide: [
          'Map all dependencies in the close process',
          'Identify parallelizable activities',
          'Redesign process sequence',
          'Implement workflow management tools',
          'Train teams for parallel work',
        ],
        benefits: ['40% shorter cycle time', 'Better resource utilization', 'Flexible scheduling'],
        aiTools: [
          { name: 'Workiva', description: 'Workflow orchestration', category: 'Workflow' },
          { name: 'FloQast', description: 'Close management platform', category: 'Close Management' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-3',
        title: 'Real-Time Data Integration',
        shortDescription: 'Continuous data updates instead of batch processing',
        implementationGuide: [
          'Inventory all data sources',
          'Evaluate real-time integration technologies',
          'Implement API-based connections',
          'Set up data quality monitoring',
          'Train for real-time analytics',
        ],
        benefits: ['Current data basis', 'Faster decisions', 'Reduced manual data entry'],
        aiTools: [
          { name: 'Fivetran', description: 'Automated data pipelines', category: 'Integration' },
          { name: 'Airbyte', description: 'Open-source ETL', category: 'Integration' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-4',
        title: 'Automated Journal Entries',
        shortDescription: 'AI-based creation of recurring journal entries',
        implementationGuide: [
          'Catalog recurring booking patterns',
          'Define booking rules and templates',
          'Implement automatic entry creation',
          'Set up approval workflows',
          'Monitor and report exceptions',
        ],
        benefits: ['80% fewer manual entries', 'Consistent booking quality', 'Timely recording'],
        aiTools: [
          { name: 'SAP S/4HANA', description: 'Integrated booking automation', category: 'ERP' },
          { name: 'Oracle Financials', description: 'Automated journal entries', category: 'ERP' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'speed-5',
        title: 'Faster Intercompany Reconciliation',
        shortDescription: 'Automated group-wide transaction reconciliation',
        implementationGuide: [
          'Standardize IC processes',
          'Implement IC matching system',
          'Automatic difference detection',
          'Workflow for difference resolution',
          'Real-time IC reporting',
        ],
        benefits: ['70% faster IC reconciliation', 'Fewer consolidation errors', 'Transparent processes'],
        aiTools: [
          { name: 'OneStream', description: 'Unified Finance Platform', category: 'CPM' },
          { name: 'BlackLine IC', description: 'Intercompany Hub', category: 'IC Management' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-6',
        title: 'Accelerated Accrual Calculation',
        shortDescription: 'Automatic calculation and posting of accruals',
        implementationGuide: [
          'Document all accrual types',
          'Develop calculation algorithms',
          'Automate data extraction',
          'Implement automatic postings',
          'Review and approval process',
        ],
        benefits: ['90% faster calculation', 'Consistent methodology', 'Audit-ready documentation'],
        aiTools: [
          { name: 'Trintech Cadency', description: 'Accrual Management', category: 'Close Management' },
          { name: 'Prophix', description: 'Automated calculations', category: 'FP&A' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'speed-7',
        title: 'AI-Powered Coding',
        shortDescription: 'Machine learning for automatic account assignment',
        implementationGuide: [
          'Collect historical coding data',
          'Train the ML model',
          'Integrate into booking process',
          'Confidence-based approval rules',
          'Continuous model training',
        ],
        benefits: ['95% accuracy rate', 'Massive time savings', 'Self-learning systems'],
        aiTools: [
          { name: 'Vic.ai', description: 'AI-powered invoice coding', category: 'AP Automation' },
          { name: 'AppZen', description: 'Intelligent booking assignment', category: 'AI Finance' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'speed-8',
        title: 'Optimized Consolidation Process',
        shortDescription: 'Automation of group consolidation',
        implementationGuide: [
          'Standardize chart of accounts',
          'Automatic currency conversion',
          'Rule-based eliminations',
          'Automated minority interest calculation',
          'Integrated reporting',
        ],
        benefits: ['50% faster consolidation', 'Less manual intervention', 'Audit-ready'],
        aiTools: [
          { name: 'SAP BPC', description: 'Business Planning & Consolidation', category: 'CPM' },
          { name: 'CCH Tagetik', description: 'Unified Performance Management', category: 'CPM' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-9',
        title: 'Automated Reporting',
        shortDescription: 'Instant report generation after close',
        implementationGuide: [
          'Define standard reports',
          'Create automated report templates',
          'Integrate with close system',
          'Automatic distribution',
          'Self-service for ad-hoc analysis',
        ],
        benefits: ['Reports in minutes', 'Consistent formatting', 'Less rework'],
        aiTools: [
          { name: 'Power BI', description: 'Business Intelligence', category: 'BI' },
          { name: 'Tableau', description: 'Data visualization', category: 'BI' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'speed-10',
        title: 'Continuous Close',
        shortDescription: 'Transition to continuous close processes',
        implementationGuide: [
          'Identify soft-close activities',
          'Shift activities into the month',
          'Implement real-time controls',
          'Automate recurring tasks',
          'Cultural change in the team',
        ],
        benefits: ['Relaxed month-end close', 'Earlier insights', 'Better work-life balance'],
        aiTools: [
          { name: 'FloQast', description: 'Continuous Accounting', category: 'Close Management' },
          { name: 'Trintech', description: 'Financial Process Automation', category: 'Automation' },
        ],
        effort: 'high',
        impact: 'high',
      },
    ],
  },
  {
    id: 'quality',
    title: 'Quality & Accuracy',
    description: 'Enhance data integrity and reduce errors with systematic quality controls',
    icon: 'checkmark.circle.fill',
    color: '#10B981',
    levers: [
      {
        id: 'quality-1',
        title: 'Automated Plausibility Checks',
        shortDescription: 'AI-based detection of anomalies and deviations',
        implementationGuide: [
          'Define critical plausibility rules',
          'Implement automatic check routines',
          'Configure thresholds',
          'Set up alerting systems',
          'Define escalation processes',
        ],
        benefits: ['Early error detection', '99% fewer missed errors', 'Audit-ready'],
        aiTools: [
          { name: 'MindBridge', description: 'AI Audit Platform', category: 'Audit' },
          { name: 'HighRadius', description: 'Anomaly detection', category: 'AI Finance' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'quality-2',
        title: 'Digital Four-Eyes Principle',
        shortDescription: 'Digitized approval and control processes',
        implementationGuide: [
          'Map all approval-required processes',
          'Define competency rules',
          'Implement digital workflows',
          'Configure audit trail',
          'Deputy arrangements',
        ],
        benefits: ['Complete documentation', 'Compliance security', 'Efficient approvals'],
        aiTools: [
          { name: 'SAP Workflow', description: 'Integrated approvals', category: 'Workflow' },
          { name: 'ServiceNow', description: 'Workflow automation', category: 'Workflow' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'quality-3',
        title: 'Standardized Checklists',
        shortDescription: 'Digital close checklists with dependencies',
        implementationGuide: [
          'Create comprehensive checklists',
          'Define dependencies',
          'Digitize and automate',
          'Integrate into close tool',
          'Regular review and adjustment',
        ],
        benefits: ['Complete processes', 'Clear responsibilities', 'Transparent status'],
        aiTools: [
          { name: 'FloQast', description: 'Close Checklists', category: 'Close Management' },
          { name: 'Blackline', description: 'Task Management', category: 'Close Management' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'quality-4',
        title: 'Automatic Documentation',
        shortDescription: 'Complete logging of all close activities',
        implementationGuide: [
          'Identify documentation-required activities',
          'Automatic log file creation',
          'Version control of all changes',
          'Central document storage',
          'Automatic archiving',
        ],
        benefits: ['Audit-ready', 'Traceability', 'Time savings in audits'],
        aiTools: [
          { name: 'Workiva', description: 'Document management', category: 'Compliance' },
          { name: 'Audit Board', description: 'Audit management', category: 'Audit' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'quality-5',
        title: 'Data Quality Monitoring',
        shortDescription: 'Continuous monitoring of data quality',
        implementationGuide: [
          'Define data quality metrics',
          'Implement data validations',
          'Set up dashboards',
          'Automatic alerting',
          'Data cleansing processes',
        ],
        benefits: ['High data quality', 'Early problem detection', 'Trust in data'],
        aiTools: [
          { name: 'Talend', description: 'Data Quality', category: 'Data Management' },
          { name: 'Informatica', description: 'Data Governance', category: 'Data Management' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'quality-6',
        title: 'Integrated Controls',
        shortDescription: 'Embedding controls in operational processes',
        implementationGuide: [
          'Map all control points',
          'Design preventive controls',
          'Automate controls',
          'Real-time control monitoring',
          'Continuous control improvement',
        ],
        benefits: ['Fewer post-corrections', 'Higher process security', 'Reduced risk'],
        aiTools: [
          { name: 'SAP GRC', description: 'Governance Risk Compliance', category: 'GRC' },
          { name: 'Workiva', description: 'Internal Controls', category: 'Compliance' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'quality-7',
        title: 'AI Variance Analysis',
        shortDescription: 'Intelligent analysis of plan vs actual deviations',
        implementationGuide: [
          'Define relevant comparison metrics',
          'Implement automatic comparisons',
          'AI-based root cause analysis',
          'Automatic commentary',
          'Drill-down functionality',
        ],
        benefits: ['Deeper insights', 'Faster explanations', 'Proactive steering'],
        aiTools: [
          { name: 'Jedox', description: 'AI Variance Analysis', category: 'FP&A' },
          { name: 'Anaplan', description: 'Connected Planning', category: 'FP&A' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'quality-8',
        title: 'Segregation of Duties',
        shortDescription: 'Automated function separation and conflict checking',
        implementationGuide: [
          'Create SoD matrix',
          'Automatic conflict checking',
          'Role and permission management',
          'Regular reviews',
          'Exception approval process',
        ],
        benefits: ['Compliance security', 'Fraud prevention', 'Clear responsibilities'],
        aiTools: [
          { name: 'SAP Access Control', description: 'SoD Management', category: 'GRC' },
          { name: 'SailPoint', description: 'Identity Governance', category: 'Security' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'quality-9',
        title: 'Root Cause Analysis',
        shortDescription: 'Systematic analysis and prevention of recurring errors',
        implementationGuide: [
          'Categorize error types',
          'Implement root cause analysis',
          'Lessons learned process',
          'Derive preventive measures',
          'Measure success of actions',
        ],
        benefits: ['Continuous improvement', 'Fewer recurring errors', 'Learning organization'],
        aiTools: [
          { name: 'Celonis', description: 'Process Mining', category: 'Process Intelligence' },
          { name: 'UiPath Process Mining', description: 'Process analysis', category: 'Process Intelligence' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'quality-10',
        title: 'Quality KPIs',
        shortDescription: 'Measurement and management of close quality',
        implementationGuide: [
          'Define quality KPIs',
          'Automatic measurement',
          'Dashboard creation',
          'Trend analysis',
          'Target agreements',
        ],
        benefits: ['Measurable quality', 'Improvement trends', 'Benchmarking capability'],
        aiTools: [
          { name: 'Power BI', description: 'KPI Dashboards', category: 'BI' },
          { name: 'Tableau', description: 'Quality metrics', category: 'BI' },
        ],
        effort: 'low',
        impact: 'medium',
      },
    ],
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Streamline operations with intelligent automation and system integration',
    icon: 'gearshape.fill',
    color: '#F59E0B',
    levers: [
      {
        id: 'automation-1',
        title: 'RPA for Routine Tasks',
        shortDescription: 'Robots for recurring manual activities',
        implementationGuide: [
          'Identify RPA-suitable processes',
          'Document and optimize processes',
          'Bot development and testing',
          'Go-live and monitoring',
          'Continuous optimization',
        ],
        benefits: ['24/7 availability', 'No human errors', 'Scalability'],
        aiTools: [
          { name: 'UiPath', description: 'Enterprise RPA Platform', category: 'RPA' },
          { name: 'Automation Anywhere', description: 'Intelligent Automation', category: 'RPA' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'automation-2',
        title: 'Intelligent Document Processing',
        shortDescription: 'AI-based extraction from invoices and receipts',
        implementationGuide: [
          'Analyze document types',
          'Train OCR/ICR system',
          'Integrate into workflows',
          'Set up quality control',
          'Continuous training',
        ],
        benefits: ['95% automatic capture', 'Faster processing', 'Less data entry'],
        aiTools: [
          { name: 'ABBYY', description: 'Intelligent document capture', category: 'IDP' },
          { name: 'Kofax', description: 'Document Intelligence', category: 'IDP' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'automation-3',
        title: 'Automatic Bank Reconciliation',
        shortDescription: 'Fully automated matching of bank transactions',
        implementationGuide: [
          'Analyze bank account structure',
          'Set up automatic bank feeds',
          'Configure matching rules',
          'Automatic posting creation',
          'Exception management',
        ],
        benefits: ['99% automatic matching', 'Daily currency', 'Early error detection'],
        aiTools: [
          { name: 'BlackLine Cash Application', description: 'Cash Matching', category: 'Reconciliation' },
          { name: 'HighRadius Cash Application', description: 'AI Cash Matching', category: 'Treasury' },
        ],
        effort: 'low',
        impact: 'high',
      },
      {
        id: 'automation-4',
        title: 'Automated Collections',
        shortDescription: 'AI-driven receivables management processes',
        implementationGuide: [
          'Segment customers',
          'Define escalation levels',
          'Automatic reminder generation',
          'Intelligent timing',
          'Success measurement',
        ],
        benefits: ['Faster cash receipt', 'Consistent communication', 'Reduced bad debt'],
        aiTools: [
          { name: 'HighRadius Collections', description: 'AI Collections', category: 'AR' },
          { name: 'Esker', description: 'AR Automation', category: 'AR' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'automation-5',
        title: 'Accounts Payable Automation',
        shortDescription: 'End-to-end automation from invoice to payment',
        implementationGuide: [
          'Analyze purchase-to-pay process',
          'Digital invoice receipt',
          'Automatic verification and coding',
          'Workflow-based approval',
          'Automatic payment',
        ],
        benefits: ['70% less effort', 'Discount optimization', 'Supplier satisfaction'],
        aiTools: [
          { name: 'SAP Ariba', description: 'Procurement Automation', category: 'P2P' },
          { name: 'Coupa', description: 'BSM Platform', category: 'P2P' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'automation-6',
        title: 'Automatic Accruals',
        shortDescription: 'Systematic calculation and posting of accruals',
        implementationGuide: [
          'Catalog all accrual types',
          'Rule-based calculation logic',
          'Automatic reversal entries',
          'Documentation and evidence',
          'Regular review',
        ],
        benefits: ['No forgotten accruals', 'Consistent methodology', 'Time savings'],
        aiTools: [
          { name: 'Blackline', description: 'Accrual Management', category: 'Close Management' },
          { name: 'Trintech', description: 'Financial Close', category: 'Close Management' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'automation-7',
        title: 'Workflow Automation',
        shortDescription: 'Digitization of all approval and authorization processes',
        implementationGuide: [
          'Map all workflows',
          'Standardize processes',
          'Implement workflows',
          'Enable mobile approvals',
          'Performance monitoring',
        ],
        benefits: ['Faster cycle times', 'Transparency', 'Audit trail'],
        aiTools: [
          { name: 'Microsoft Power Automate', description: 'Low-code workflows', category: 'Workflow' },
          { name: 'Nintex', description: 'Process Automation', category: 'Workflow' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'automation-8',
        title: 'Fixed Asset Automation',
        shortDescription: 'Automated depreciation and asset management',
        implementationGuide: [
          'Clean up asset inventory',
          'Automatic depreciation calculation',
          'Integration with procurement',
          'Automatic additions/disposals',
          'Inventory support',
        ],
        benefits: ['Error-free depreciation', 'Current asset values', 'Less manual maintenance'],
        aiTools: [
          { name: 'SAP Asset Management', description: 'Fixed asset accounting', category: 'ERP' },
          { name: 'Oracle Fixed Assets', description: 'Asset lifecycle', category: 'ERP' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'automation-9',
        title: 'Tax Automation',
        shortDescription: 'Automatic tax calculation and filing',
        implementationGuide: [
          'Map tax requirements',
          'Automatic tax determination',
          'System integration',
          'Automatic filings',
          'Audit support',
        ],
        benefits: ['Compliance security', 'Lower tax risks', 'Efficient filing processes'],
        aiTools: [
          { name: 'Vertex', description: 'Tax Technology', category: 'Tax' },
          { name: 'Thomson Reuters ONESOURCE', description: 'Tax Compliance', category: 'Tax' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'automation-10',
        title: 'Report Automation',
        shortDescription: 'Automatic creation and distribution of reports',
        implementationGuide: [
          'Standardize reports',
          'Create templates',
          'Automatic data population',
          'Scheduled distribution',
          'Self-service options',
        ],
        benefits: ['Instant reports', 'Consistency', 'Team relief'],
        aiTools: [
          { name: 'Workiva', description: 'Reporting Automation', category: 'Reporting' },
          { name: 'Narrative Science', description: 'Automated Narratives', category: 'AI Reporting' },
        ],
        effort: 'low',
        impact: 'medium',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Governance',
    description: 'Strengthen controls and ensure regulatory adherence with robust governance',
    icon: 'shield.fill',
    color: '#3B82F6',
    levers: [
      {
        id: 'compliance-1',
        title: 'Predictive Analytics',
        shortDescription: 'AI-based forecasts for cash flow and results',
        implementationGuide: [
          'Identify relevant prediction cases',
          'Data preparation and quality',
          'Model development and training',
          'Integration into planning processes',
          'Continuous model improvement',
        ],
        benefits: ['Better planning accuracy', 'Earlier warnings', 'Proactive steering'],
        aiTools: [
          { name: 'IBM Planning Analytics', description: 'AI Forecasting', category: 'FP&A' },
          { name: 'Anaplan', description: 'Predictive Planning', category: 'FP&A' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'compliance-2',
        title: 'Automatic Anomaly Detection',
        shortDescription: 'AI-powered identification of unusual transactions',
        implementationGuide: [
          'Define normal behavior',
          'ML model for anomaly detection',
          'Integration into daily business',
          'Alerting and escalation',
          'Feedback loop for training',
        ],
        benefits: ['Early fraud detection', 'Risk minimization', 'Proactive control'],
        aiTools: [
          { name: 'MindBridge', description: 'AI Auditor', category: 'Audit' },
          { name: 'DataRobot', description: 'AutoML Platform', category: 'AI/ML' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'compliance-3',
        title: 'Natural Language Queries',
        shortDescription: 'Data queries in natural language',
        implementationGuide: [
          'Select suitable tools',
          'Connect with data sources',
          'Train for business terminology',
          'Promote user adoption',
          'Expand capabilities',
        ],
        benefits: ['Democratization of data', 'Faster answers', 'BI team relief'],
        aiTools: [
          { name: 'ThoughtSpot', description: 'Search & AI Analytics', category: 'BI' },
          { name: 'Power BI Copilot', description: 'Natural Language BI', category: 'BI' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'compliance-4',
        title: 'Automatic Commentary',
        shortDescription: 'AI-generated explanations for variances',
        implementationGuide: [
          'Train with historical comments',
          'Integrate into reporting system',
          'Quality assurance of texts',
          'Allow user customization',
          'Continuous training',
        ],
        benefits: ['Time savings', 'Consistent explanations', 'Faster reports'],
        aiTools: [
          { name: 'Narrative Science Quill', description: 'Automated Narratives', category: 'NLG' },
          { name: 'Arria NLG', description: 'Natural Language Generation', category: 'NLG' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'compliance-5',
        title: 'Driver Tree Analysis',
        shortDescription: 'Automatic breakdown of KPIs into drivers',
        implementationGuide: [
          'Define KPI hierarchies',
          'Automatic calculation of contributions',
          'Visualization in driver trees',
          'Drill-down functionality',
          'What-if scenarios',
        ],
        benefits: ['Deep understanding', 'Fast root cause analysis', 'Informed decisions'],
        aiTools: [
          { name: 'Jedox', description: 'Driver-Based Planning', category: 'FP&A' },
          { name: 'Board', description: 'Decision Making Platform', category: 'FP&A' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'compliance-6',
        title: 'Benchmark Analysis',
        shortDescription: 'Automatic comparison with competitors and industry',
        implementationGuide: [
          'Identify relevant benchmarks',
          'Integrate data sources',
          'Automatic comparison calculations',
          'Visualization of positioning',
          'Derive action recommendations',
        ],
        benefits: ['Market perspective', 'Gap identification', 'Strategic insights'],
        aiTools: [
          { name: 'Bloomberg Terminal', description: 'Financial Data', category: 'Data Provider' },
          { name: 'S&P Capital IQ', description: 'Market Intelligence', category: 'Data Provider' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'compliance-7',
        title: 'Scenario Modeling',
        shortDescription: 'AI-supported simulation of future scenarios',
        implementationGuide: [
          'Define relevant scenarios',
          'Model cause-effect relationships',
          'Automatic calculation of impacts',
          'Visualization of results',
          'Integration into planning',
        ],
        benefits: ['Better preparation', 'Faster response', 'Informed strategies'],
        aiTools: [
          { name: 'Anaplan', description: 'Scenario Planning', category: 'FP&A' },
          { name: 'Workday Adaptive', description: 'Enterprise Planning', category: 'FP&A' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'compliance-8',
        title: 'Cash Flow Forecasting',
        shortDescription: 'AI-based daily liquidity prediction',
        implementationGuide: [
          'Integrate all cash sources',
          'ML model for forecasts',
          'Daily updates',
          'Alerting for bottlenecks',
          'Optimization recommendations',
        ],
        benefits: ['Optimized liquidity', 'Fewer surprises', 'Better returns'],
        aiTools: [
          { name: 'Kyriba', description: 'Treasury Management', category: 'Treasury' },
          { name: 'GTreasury', description: 'Cash Forecasting', category: 'Treasury' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'compliance-9',
        title: 'Risk Scoring',
        shortDescription: 'Automatic assessment of financial risks',
        implementationGuide: [
          'Define risk categories',
          'Develop scoring model',
          'Automatic data aggregation',
          'Dashboard for risk managers',
          'Early warning system',
        ],
        benefits: ['Proactive risk management', 'Prioritization', 'Better decisions'],
        aiTools: [
          { name: 'SAS Risk Management', description: 'Enterprise Risk', category: 'Risk' },
          { name: "Moody's Analytics", description: 'Credit Risk', category: 'Risk' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'compliance-10',
        title: 'Performance Attribution',
        shortDescription: 'Automatic breakdown of result changes',
        implementationGuide: [
          'Define attribution factors',
          'Implement calculation logic',
          'Automatic monthly analysis',
          'Visualization of drivers',
          'Management reporting',
        ],
        benefits: ['Clear success attribution', 'Transparent communication', 'Focused steering'],
        aiTools: [
          { name: 'SAP Analytics Cloud', description: 'Variance Analysis', category: 'Analytics' },
          { name: 'Oracle EPM', description: 'Performance Management', category: 'CPM' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
    ],
  },
];

export const getAllAITools = (): AITool[] => {
  const toolsMap = new Map<string, AITool>();
  
  goals.forEach(goal => {
    goal.levers.forEach(lever => {
      lever.aiTools.forEach(tool => {
        if (!toolsMap.has(tool.name)) {
          toolsMap.set(tool.name, tool);
        }
      });
    });
  });
  
  return Array.from(toolsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getToolCategories = (): string[] => {
  const categories = new Set<string>();
  
  goals.forEach(goal => {
    goal.levers.forEach(lever => {
      lever.aiTools.forEach(tool => {
        categories.add(tool.category);
      });
    });
  });
  
  return Array.from(categories).sort();
};
