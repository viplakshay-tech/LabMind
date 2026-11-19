import type { Experiment } from "@/types/experiment";

export type LabDepartment = { id:string; name:string; slug:string; icon:string; description:string; };
export type LabSubject = { id:string; departmentId:string; name:string; slug:string; description:string; };
export type LabModule = { id:string; subjectId:string; name:string; order:number; };
export type LabCapabilities = { simulation:boolean; aiTutor:boolean; troubleshooting:boolean; vision:boolean; viva:boolean; report:boolean; analytics:boolean; digitalTwin3D:boolean; timeline4D:boolean; };
export type LabCatalogExperiment = Experiment & { departmentId:string; department:string; subjectId:string; subject:string; moduleId:string; module:string; catalogStatus:"CORE"|"CATALOG"; engineType:string; capabilities:LabCapabilities; semester:string; learningMode:"Hands-on"|"Simulation"|"Dataset"|"Numerical"|"Conceptual"; };

export const labDepartments: LabDepartment[] = [
  { id:'ece', name:'Electronics & Communication Engineering', slug:'electronics-communication-engineering', icon:'Cpu', description:'Organized laboratory ecosystem for Electronics & Communication Engineering.' },
  { id:'cse', name:'Computer Science & Engineering', slug:'computer-science-engineering', icon:'Code2', description:'Organized laboratory ecosystem for Computer Science & Engineering.' },
  { id:'aiml', name:'Artificial Intelligence & Machine Learning', slug:'artificial-intelligence-machine-learning', icon:'BrainCircuit', description:'Organized laboratory ecosystem for Artificial Intelligence & Machine Learning.' },
  { id:'eee', name:'Electrical & Electronics Engineering', slug:'electrical-electronics-engineering', icon:'Zap', description:'Organized laboratory ecosystem for Electrical & Electronics Engineering.' },
  { id:'me', name:'Mechanical Engineering', slug:'mechanical-engineering', icon:'Cog', description:'Organized laboratory ecosystem for Mechanical Engineering.' },
  { id:'civil', name:'Civil Engineering', slug:'civil-engineering', icon:'Building2', description:'Organized laboratory ecosystem for Civil Engineering.' },
  { id:'physics', name:'Engineering Physics', slug:'engineering-physics', icon:'Atom', description:'Organized laboratory ecosystem for Engineering Physics.' },
  { id:'chemistry', name:'Chemistry', slug:'chemistry', icon:'FlaskConical', description:'Organized laboratory ecosystem for Chemistry.' },
  { id:'math', name:'Mathematics & Computational Science', slug:'mathematics-computational-science', icon:'Sigma', description:'Organized laboratory ecosystem for Mathematics & Computational Science.' },
  { id:'biotech', name:'Biotechnology', slug:'biotechnology', icon:'Dna', description:'Organized laboratory ecosystem for Biotechnology.' },
  { id:'instrumentation', name:'Instrumentation & Control Engineering', slug:'instrumentation-control-engineering', icon:'Gauge', description:'Organized laboratory ecosystem for Instrumentation & Control Engineering.' },
  { id:'automobile', name:'Automobile Engineering', slug:'automobile-engineering', icon:'Car', description:'Organized laboratory ecosystem for Automobile Engineering.' },
];

export const labSubjects: LabSubject[] = [
  { id:'digital-electronics', departmentId:'ece', name:'Digital Electronics', slug:'digital-electronics', description:'Structured laboratory subject covering Digital Electronics.' },
  { id:'analog-electronics', departmentId:'ece', name:'Analog Electronics', slug:'analog-electronics', description:'Structured laboratory subject covering Analog Electronics.' },
  { id:'signals-communication', departmentId:'ece', name:'Signals & Communication', slug:'signals-communication', description:'Structured laboratory subject covering Signals & Communication.' },
  { id:'programming-dsa', departmentId:'cse', name:'Programming & Data Structures', slug:'programming-data-structures', description:'Structured laboratory subject covering Programming & Data Structures.' },
  { id:'dbms', departmentId:'cse', name:'Database Management Systems', slug:'database-management-systems', description:'Structured laboratory subject covering Database Management Systems.' },
  { id:'operating-systems', departmentId:'cse', name:'Operating Systems', slug:'operating-systems', description:'Structured laboratory subject covering Operating Systems.' },
  { id:'computer-networks', departmentId:'cse', name:'Computer Networks', slug:'computer-networks', description:'Structured laboratory subject covering Computer Networks.' },
  { id:'software-engineering', departmentId:'cse', name:'Software Engineering', slug:'software-engineering', description:'Structured laboratory subject covering Software Engineering.' },
  { id:'data-science', departmentId:'aiml', name:'Data Science', slug:'data-science', description:'Structured laboratory subject covering Data Science.' },
  { id:'machine-learning', departmentId:'aiml', name:'Machine Learning', slug:'machine-learning', description:'Structured laboratory subject covering Machine Learning.' },
  { id:'deep-learning-cv', departmentId:'aiml', name:'Deep Learning & Computer Vision', slug:'deep-learning-computer-vision', description:'Structured laboratory subject covering Deep Learning & Computer Vision.' },
  { id:'basic-electrical', departmentId:'eee', name:'Basic Electrical Engineering', slug:'basic-electrical-engineering', description:'Structured laboratory subject covering Basic Electrical Engineering.' },
  { id:'electrical-machines', departmentId:'eee', name:'Electrical Machines', slug:'electrical-machines', description:'Structured laboratory subject covering Electrical Machines.' },
  { id:'power-control', departmentId:'eee', name:'Power Systems & Control', slug:'power-systems-control', description:'Structured laboratory subject covering Power Systems & Control.' },
  { id:'thermo-ice', departmentId:'me', name:'Thermodynamics & IC Engines', slug:'thermodynamics-ic-engines', description:'Structured laboratory subject covering Thermodynamics & IC Engines.' },
  { id:'manufacturing', departmentId:'me', name:'Manufacturing Processes', slug:'manufacturing-processes', description:'Structured laboratory subject covering Manufacturing Processes.' },
  { id:'fluid-cad', departmentId:'me', name:'Fluid Mechanics & CAD', slug:'fluid-mechanics-cad', description:'Structured laboratory subject covering Fluid Mechanics & CAD.' },
  { id:'surveying', departmentId:'civil', name:'Surveying & Geomatics', slug:'surveying-geomatics', description:'Structured laboratory subject covering Surveying & Geomatics.' },
  { id:'structures', departmentId:'civil', name:'Structural Engineering', slug:'structural-engineering', description:'Structured laboratory subject covering Structural Engineering.' },
  { id:'geotech-hydraulics', departmentId:'civil', name:'Geotechnical & Hydraulic Engineering', slug:'geotechnical-hydraulic-engineering', description:'Structured laboratory subject covering Geotechnical & Hydraulic Engineering.' },
  { id:'engineering-physics', departmentId:'physics', name:'Engineering Physics', slug:'engineering-physics', description:'Structured laboratory subject covering Engineering Physics.' },
  { id:'instrumentation-physics', departmentId:'physics', name:'Instrumentation Physics', slug:'instrumentation-physics', description:'Structured laboratory subject covering Instrumentation Physics.' },
  { id:'engineering-chemistry', departmentId:'chemistry', name:'Engineering Chemistry', slug:'engineering-chemistry', description:'Structured laboratory subject covering Engineering Chemistry.' },
  { id:'materials-chemistry', departmentId:'chemistry', name:'Materials Chemistry', slug:'materials-chemistry', description:'Structured laboratory subject covering Materials Chemistry.' },
  { id:'applied-mathematics', departmentId:'math', name:'Applied Mathematics', slug:'applied-mathematics', description:'Structured laboratory subject covering Applied Mathematics.' },
  { id:'numerical-optimization', departmentId:'math', name:'Numerical Methods & Optimization', slug:'numerical-methods-optimization', description:'Structured laboratory subject covering Numerical Methods & Optimization.' },
  { id:'biotech-techniques', departmentId:'biotech', name:'Biotechnology Techniques', slug:'biotechnology-techniques', description:'Structured laboratory subject covering Biotechnology Techniques.' },
  { id:'bioinformatics', departmentId:'biotech', name:'Bioinformatics', slug:'bioinformatics', description:'Structured laboratory subject covering Bioinformatics.' },
  { id:'sensors-transducers', departmentId:'instrumentation', name:'Sensors & Transducers', slug:'sensors-transducers', description:'Structured laboratory subject covering Sensors & Transducers.' },
  { id:'process-instrumentation', departmentId:'instrumentation', name:'Process Instrumentation & Control', slug:'process-instrumentation-control', description:'Structured laboratory subject covering Process Instrumentation & Control.' },
  { id:'automotive-systems', departmentId:'automobile', name:'Automotive Systems', slug:'automotive-systems', description:'Structured laboratory subject covering Automotive Systems.' },
];

export const labModules: LabModule[] = [
  { id:'digital-electronics-logic-fundamentals', subjectId:'digital-electronics', name:'Logic Fundamentals', order:1 },
  { id:'digital-electronics-combinational-logic', subjectId:'digital-electronics', name:'Combinational Logic', order:2 },
  { id:'digital-electronics-sequential-logic', subjectId:'digital-electronics', name:'Sequential Logic', order:3 },
  { id:'digital-electronics-data-conversion', subjectId:'digital-electronics', name:'Data Conversion', order:4 },
  { id:'analog-electronics-diodes-rectifiers', subjectId:'analog-electronics', name:'Diodes & Rectifiers', order:1 },
  { id:'analog-electronics-transistors', subjectId:'analog-electronics', name:'Transistors', order:2 },
  { id:'analog-electronics-fet-mosfet', subjectId:'analog-electronics', name:'FET & MOSFET', order:3 },
  { id:'analog-electronics-operational-amplifiers', subjectId:'analog-electronics', name:'Operational Amplifiers', order:4 },
  { id:'signals-communication-signals', subjectId:'signals-communication', name:'Signals', order:1 },
  { id:'signals-communication-fourier-analysis', subjectId:'signals-communication', name:'Fourier Analysis', order:2 },
  { id:'signals-communication-communication', subjectId:'signals-communication', name:'Communication', order:3 },
  { id:'signals-communication-digital-communication', subjectId:'signals-communication', name:'Digital Communication', order:4 },
  { id:'programming-dsa-programming-basics', subjectId:'programming-dsa', name:'Programming Basics', order:1 },
  { id:'programming-dsa-linear-structures', subjectId:'programming-dsa', name:'Linear Structures', order:2 },
  { id:'programming-dsa-trees-graphs', subjectId:'programming-dsa', name:'Trees & Graphs', order:3 },
  { id:'programming-dsa-algorithms', subjectId:'programming-dsa', name:'Algorithms', order:4 },
  { id:'dbms-relational-model', subjectId:'dbms', name:'Relational Model', order:1 },
  { id:'dbms-sql', subjectId:'dbms', name:'SQL', order:2 },
  { id:'dbms-transactions', subjectId:'dbms', name:'Transactions', order:3 },
  { id:'dbms-indexing-storage', subjectId:'dbms', name:'Indexing & Storage', order:4 },
  { id:'operating-systems-processes', subjectId:'operating-systems', name:'Processes', order:1 },
  { id:'operating-systems-threads-concurrency', subjectId:'operating-systems', name:'Threads & Concurrency', order:2 },
  { id:'operating-systems-memory', subjectId:'operating-systems', name:'Memory', order:3 },
  { id:'operating-systems-file-systems', subjectId:'operating-systems', name:'File Systems', order:4 },
  { id:'computer-networks-network-basics', subjectId:'computer-networks', name:'Network Basics', order:1 },
  { id:'computer-networks-routing', subjectId:'computer-networks', name:'Routing', order:2 },
  { id:'computer-networks-transport', subjectId:'computer-networks', name:'Transport', order:3 },
  { id:'computer-networks-applications-security', subjectId:'computer-networks', name:'Applications & Security', order:4 },
  { id:'software-engineering-requirements', subjectId:'software-engineering', name:'Requirements', order:1 },
  { id:'software-engineering-design', subjectId:'software-engineering', name:'Design', order:2 },
  { id:'software-engineering-testing', subjectId:'software-engineering', name:'Testing', order:3 },
  { id:'software-engineering-project-quality', subjectId:'software-engineering', name:'Project Quality', order:4 },
  { id:'data-science-data-preparation', subjectId:'data-science', name:'Data Preparation', order:1 },
  { id:'data-science-statistics', subjectId:'data-science', name:'Statistics', order:2 },
  { id:'data-science-visualization', subjectId:'data-science', name:'Visualization', order:3 },
  { id:'data-science-feature-engineering', subjectId:'data-science', name:'Feature Engineering', order:4 },
  { id:'machine-learning-regression', subjectId:'machine-learning', name:'Regression', order:1 },
  { id:'machine-learning-classification', subjectId:'machine-learning', name:'Classification', order:2 },
  { id:'machine-learning-ensembles-tuning', subjectId:'machine-learning', name:'Ensembles & Tuning', order:3 },
  { id:'machine-learning-unsupervised-learning', subjectId:'machine-learning', name:'Unsupervised Learning', order:4 },
  { id:'deep-learning-cv-neural-networks', subjectId:'deep-learning-cv', name:'Neural Networks', order:1 },
  { id:'deep-learning-cv-cnn', subjectId:'deep-learning-cv', name:'CNN', order:2 },
  { id:'deep-learning-cv-computer-vision', subjectId:'deep-learning-cv', name:'Computer Vision', order:3 },
  { id:'deep-learning-cv-sequence-models', subjectId:'deep-learning-cv', name:'Sequence Models', order:4 },
  { id:'basic-electrical-dc-circuits', subjectId:'basic-electrical', name:'DC Circuits', order:1 },
  { id:'basic-electrical-ac-circuits', subjectId:'basic-electrical', name:'AC Circuits', order:2 },
  { id:'basic-electrical-network-theorems', subjectId:'basic-electrical', name:'Network Theorems', order:3 },
  { id:'basic-electrical-measurements', subjectId:'basic-electrical', name:'Measurements', order:4 },
  { id:'electrical-machines-transformers', subjectId:'electrical-machines', name:'Transformers', order:1 },
  { id:'electrical-machines-dc-machines', subjectId:'electrical-machines', name:'DC Machines', order:2 },
  { id:'electrical-machines-induction-machines', subjectId:'electrical-machines', name:'Induction Machines', order:3 },
  { id:'electrical-machines-synchronous-machines', subjectId:'electrical-machines', name:'Synchronous Machines', order:4 },
  { id:'power-control-power-systems', subjectId:'power-control', name:'Power Systems', order:1 },
  { id:'power-control-protection', subjectId:'power-control', name:'Protection', order:2 },
  { id:'power-control-control-systems', subjectId:'power-control', name:'Control Systems', order:3 },
  { id:'power-control-power-electronics', subjectId:'power-control', name:'Power Electronics', order:4 },
  { id:'thermo-ice-thermodynamics', subjectId:'thermo-ice', name:'Thermodynamics', order:1 },
  { id:'thermo-ice-heat-transfer', subjectId:'thermo-ice', name:'Heat Transfer', order:2 },
  { id:'thermo-ice-ic-engines', subjectId:'thermo-ice', name:'IC Engines', order:3 },
  { id:'thermo-ice-refrigeration', subjectId:'thermo-ice', name:'Refrigeration', order:4 },
  { id:'manufacturing-machining', subjectId:'manufacturing', name:'Machining', order:1 },
  { id:'manufacturing-casting', subjectId:'manufacturing', name:'Casting', order:2 },
  { id:'manufacturing-welding', subjectId:'manufacturing', name:'Welding', order:3 },
  { id:'manufacturing-metrology', subjectId:'manufacturing', name:'Metrology', order:4 },
  { id:'fluid-cad-fluid-mechanics', subjectId:'fluid-cad', name:'Fluid Mechanics', order:1 },
  { id:'fluid-cad-hydraulics', subjectId:'fluid-cad', name:'Hydraulics', order:2 },
  { id:'fluid-cad-cad', subjectId:'fluid-cad', name:'CAD', order:3 },
  { id:'fluid-cad-mechanisms', subjectId:'fluid-cad', name:'Mechanisms', order:4 },
  { id:'surveying-basic-surveying', subjectId:'surveying', name:'Basic Surveying', order:1 },
  { id:'surveying-modern-surveying', subjectId:'surveying', name:'Modern Surveying', order:2 },
  { id:'surveying-photogrammetry-gis', subjectId:'surveying', name:'Photogrammetry & GIS', order:3 },
  { id:'surveying-setting-out', subjectId:'surveying', name:'Setting Out', order:4 },
  { id:'structures-materials', subjectId:'structures', name:'Materials', order:1 },
  { id:'structures-concrete', subjectId:'structures', name:'Concrete', order:2 },
  { id:'structures-structural-analysis', subjectId:'structures', name:'Structural Analysis', order:3 },
  { id:'structures-steel-structures', subjectId:'structures', name:'Steel Structures', order:4 },
  { id:'geotech-hydraulics-soil-mechanics', subjectId:'geotech-hydraulics', name:'Soil Mechanics', order:1 },
  { id:'geotech-hydraulics-foundation-engineering', subjectId:'geotech-hydraulics', name:'Foundation Engineering', order:2 },
  { id:'geotech-hydraulics-open-channel-flow', subjectId:'geotech-hydraulics', name:'Open Channel Flow', order:3 },
  { id:'geotech-hydraulics-water-resources', subjectId:'geotech-hydraulics', name:'Water Resources', order:4 },
  { id:'engineering-physics-optics', subjectId:'engineering-physics', name:'Optics', order:1 },
  { id:'engineering-physics-semiconductor-physics', subjectId:'engineering-physics', name:'Semiconductor Physics', order:2 },
  { id:'engineering-physics-quantum-atomic', subjectId:'engineering-physics', name:'Quantum & Atomic', order:3 },
  { id:'engineering-physics-properties-waves', subjectId:'engineering-physics', name:'Properties & Waves', order:4 },
  { id:'instrumentation-physics-measurement', subjectId:'instrumentation-physics', name:'Measurement', order:1 },
  { id:'instrumentation-physics-sensors', subjectId:'instrumentation-physics', name:'Sensors', order:2 },
  { id:'instrumentation-physics-lasers-fiber', subjectId:'instrumentation-physics', name:'Lasers & Fiber', order:3 },
  { id:'instrumentation-physics-materials', subjectId:'instrumentation-physics', name:'Materials', order:4 },
  { id:'engineering-chemistry-water-analysis', subjectId:'engineering-chemistry', name:'Water Analysis', order:1 },
  { id:'engineering-chemistry-electrochemistry', subjectId:'engineering-chemistry', name:'Electrochemistry', order:2 },
  { id:'engineering-chemistry-fuel-energy', subjectId:'engineering-chemistry', name:'Fuel & Energy', order:3 },
  { id:'engineering-chemistry-polymers', subjectId:'engineering-chemistry', name:'Polymers', order:4 },
  { id:'materials-chemistry-metals', subjectId:'materials-chemistry', name:'Metals', order:1 },
  { id:'materials-chemistry-nanomaterials', subjectId:'materials-chemistry', name:'Nanomaterials', order:2 },
  { id:'materials-chemistry-spectroscopy', subjectId:'materials-chemistry', name:'Spectroscopy', order:3 },
  { id:'materials-chemistry-green-chemistry', subjectId:'materials-chemistry', name:'Green Chemistry', order:4 },
  { id:'applied-mathematics-calculus', subjectId:'applied-mathematics', name:'Calculus', order:1 },
  { id:'applied-mathematics-linear-algebra', subjectId:'applied-mathematics', name:'Linear Algebra', order:2 },
  { id:'applied-mathematics-probability', subjectId:'applied-mathematics', name:'Probability', order:3 },
  { id:'applied-mathematics-statistics', subjectId:'applied-mathematics', name:'Statistics', order:4 },
  { id:'numerical-optimization-numerical-ode', subjectId:'numerical-optimization', name:'Numerical ODE', order:1 },
  { id:'numerical-optimization-optimization', subjectId:'numerical-optimization', name:'Optimization', order:2 },
  { id:'numerical-optimization-interpolation', subjectId:'numerical-optimization', name:'Interpolation', order:3 },
  { id:'numerical-optimization-transforms', subjectId:'numerical-optimization', name:'Transforms', order:4 },
  { id:'biotech-techniques-microbiology', subjectId:'biotech-techniques', name:'Microbiology', order:1 },
  { id:'biotech-techniques-biochemistry', subjectId:'biotech-techniques', name:'Biochemistry', order:2 },
  { id:'biotech-techniques-cell-biology', subjectId:'biotech-techniques', name:'Cell Biology', order:3 },
  { id:'biotech-techniques-molecular-biology', subjectId:'biotech-techniques', name:'Molecular Biology', order:4 },
  { id:'bioinformatics-sequence-analysis', subjectId:'bioinformatics', name:'Sequence Analysis', order:1 },
  { id:'bioinformatics-databases', subjectId:'bioinformatics', name:'Databases', order:2 },
  { id:'bioinformatics-structural-bioinformatics', subjectId:'bioinformatics', name:'Structural Bioinformatics', order:3 },
  { id:'bioinformatics-systems-biology', subjectId:'bioinformatics', name:'Systems Biology', order:4 },
  { id:'sensors-transducers-temperature-pressure', subjectId:'sensors-transducers', name:'Temperature & Pressure', order:1 },
  { id:'sensors-transducers-flow-level', subjectId:'sensors-transducers', name:'Flow & Level', order:2 },
  { id:'sensors-transducers-displacement-motion', subjectId:'sensors-transducers', name:'Displacement & Motion', order:3 },
  { id:'sensors-transducers-signal-conditioning', subjectId:'sensors-transducers', name:'Signal Conditioning', order:4 },
  { id:'process-instrumentation-control-loops', subjectId:'process-instrumentation', name:'Control Loops', order:1 },
  { id:'process-instrumentation-controllers', subjectId:'process-instrumentation', name:'Controllers', order:2 },
  { id:'process-instrumentation-industrial-communication', subjectId:'process-instrumentation', name:'Industrial Communication', order:3 },
  { id:'process-instrumentation-data-acquisition', subjectId:'process-instrumentation', name:'Data Acquisition', order:4 },
  { id:'automotive-systems-engine-systems', subjectId:'automotive-systems', name:'Engine Systems', order:1 },
  { id:'automotive-systems-vehicle-dynamics', subjectId:'automotive-systems', name:'Vehicle Dynamics', order:2 },
  { id:'automotive-systems-powertrain', subjectId:'automotive-systems', name:'Powertrain', order:3 },
  { id:'automotive-systems-vehicle-diagnostics', subjectId:'automotive-systems', name:'Vehicle Diagnostics', order:4 },
];

const subjectBlueprints: Record<string,string[]> = {
  'digital-electronics': ["Logic Fundamentals", "Combinational Logic", "Sequential Logic", "Data Conversion"],
  'analog-electronics': ["Diodes & Rectifiers", "Transistors", "FET & MOSFET", "Operational Amplifiers"],
  'signals-communication': ["Signals", "Fourier Analysis", "Communication", "Digital Communication"],
  'programming-dsa': ["Programming Basics", "Linear Structures", "Trees & Graphs", "Algorithms"],
  'dbms': ["Relational Model", "SQL", "Transactions", "Indexing & Storage"],
  'operating-systems': ["Processes", "Threads & Concurrency", "Memory", "File Systems"],
  'computer-networks': ["Network Basics", "Routing", "Transport", "Applications & Security"],
  'software-engineering': ["Requirements", "Design", "Testing", "Project Quality"],
  'data-science': ["Data Preparation", "Statistics", "Visualization", "Feature Engineering"],
  'machine-learning': ["Regression", "Classification", "Ensembles & Tuning", "Unsupervised Learning"],
  'deep-learning-cv': ["Neural Networks", "CNN", "Computer Vision", "Sequence Models"],
  'basic-electrical': ["DC Circuits", "AC Circuits", "Network Theorems", "Measurements"],
  'electrical-machines': ["Transformers", "DC Machines", "Induction Machines", "Synchronous Machines"],
  'power-control': ["Power Systems", "Protection", "Control Systems", "Power Electronics"],
  'thermo-ice': ["Thermodynamics", "Heat Transfer", "IC Engines", "Refrigeration"],
  'manufacturing': ["Machining", "Casting", "Welding", "Metrology"],
  'fluid-cad': ["Fluid Mechanics", "Hydraulics", "CAD", "Mechanisms"],
  'surveying': ["Basic Surveying", "Modern Surveying", "Photogrammetry & GIS", "Setting Out"],
  'structures': ["Materials", "Concrete", "Structural Analysis", "Steel Structures"],
  'geotech-hydraulics': ["Soil Mechanics", "Foundation Engineering", "Open Channel Flow", "Water Resources"],
  'engineering-physics': ["Optics", "Semiconductor Physics", "Quantum & Atomic", "Properties & Waves"],
  'instrumentation-physics': ["Measurement", "Sensors", "Lasers & Fiber", "Materials"],
  'engineering-chemistry': ["Water Analysis", "Electrochemistry", "Fuel & Energy", "Polymers"],
  'materials-chemistry': ["Metals", "Nanomaterials", "Spectroscopy", "Green Chemistry"],
  'applied-mathematics': ["Calculus", "Linear Algebra", "Probability", "Statistics"],
  'numerical-optimization': ["Numerical ODE", "Optimization", "Interpolation", "Transforms"],
  'biotech-techniques': ["Microbiology", "Biochemistry", "Cell Biology", "Molecular Biology"],
  'bioinformatics': ["Sequence Analysis", "Databases", "Structural Bioinformatics", "Systems Biology"],
  'sensors-transducers': ["Temperature & Pressure", "Flow & Level", "Displacement & Motion", "Signal Conditioning"],
  'process-instrumentation': ["Control Loops", "Controllers", "Industrial Communication", "Data Acquisition"],
  'automotive-systems': ["Engine Systems", "Vehicle Dynamics", "Powertrain", "Vehicle Diagnostics"],
};

function getDomain(departmentId:string): keyof typeof ARCHETYPES {
  if (["ece","eee","me","civil","physics","instrumentation","automobile"].includes(departmentId)) return "electronics";
  if (departmentId === "cse") return "cs";
  if (departmentId === "aiml") return "ai";
  if (departmentId === "math") return "math";
  if (departmentId === "biotech") return "bio";
  return "chemistry";
}

const ARCHETYPES = {"electronics":["Verification Study","Characteristic Measurement","Design Exercise","Performance Analysis","Fault Diagnosis"],"cs":["Implementation Exercise","Algorithm Analysis","Benchmarking Study","Debugging Exercise","Visualization Study"],"ai":["Dataset Preparation","Model Training Study","Evaluation Comparison","Hyperparameter Study","Explainability Analysis"],"math":["Numerical Solution","Error Analysis","Convergence Study","Method Comparison","Visualization Study"],"bio":["Preparation Protocol","Quantification Study","Characterization Experiment","Comparison Study","Analysis Workflow"],"chemistry":["Preparation & Titration","Quantitative Analysis","Characterization Study","Comparison Study","Process Optimization"]} as const;

function engineFor(departmentId:string, domain:keyof typeof ARCHETYPES) {
  const hardware=["ece","eee","me","civil","physics","instrumentation","automobile"].includes(departmentId);
  if (domain === "ai") return { engineType:"ai-dataset", learningMode:"Dataset" as const, capabilities:{simulation:true,aiTutor:true,troubleshooting:true,vision:true,viva:true,report:true,analytics:true,digitalTwin3D:false,timeline4D:true} };
  if (domain === "math") return { engineType:"numerical", learningMode:"Numerical" as const, capabilities:{simulation:true,aiTutor:true,troubleshooting:false,vision:false,viva:true,report:true,analytics:true,digitalTwin3D:false,timeline4D:true} };
  if (domain === "cs") return { engineType:"software-lab", learningMode:"Simulation" as const, capabilities:{simulation:true,aiTutor:true,troubleshooting:true,vision:false,viva:true,report:true,analytics:true,digitalTwin3D:false,timeline4D:true} };
  if (domain === "bio") return { engineType:"bio-lab", learningMode:"Hands-on" as const, capabilities:{simulation:true,aiTutor:true,troubleshooting:true,vision:true,viva:true,report:true,analytics:true,digitalTwin3D:false,timeline4D:true} };
  if (domain === "chemistry") return { engineType:"chemistry-lab", learningMode:"Hands-on" as const, capabilities:{simulation:true,aiTutor:true,troubleshooting:true,vision:true,viva:true,report:true,analytics:true,digitalTwin3D:false,timeline4D:true} };
  return { engineType:"engineering-lab", learningMode:hardware?"Hands-on":"Conceptual" as const, capabilities:{simulation:true,aiTutor:true,troubleshooting:true,vision:hardware,viva:true,report:true,analytics:true,digitalTwin3D:hardware,timeline4D:true} };
}

export const catalogExperiments: LabCatalogExperiment[] = (() => {
  const subjects=new Map(labSubjects.map(x=>[x.id,x]));
  const departments=new Map(labDepartments.map(x=>[x.id,x]));
  const result:LabCatalogExperiment[]=[]; let seq=1001;
  for (const [subjectId,modules] of Object.entries(subjectBlueprints)) {
    const subject=subjects.get(subjectId)!; const department=departments.get(subject.departmentId)!; const domain=getDomain(department.id);
    for (const moduleName of modules) {
      const moduleId=`${subjectId}-${moduleName.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`;
      ARCHETYPES[domain].forEach((archetype,index)=>{
        const title=`${moduleName} — ${archetype}`; const engine=engineFor(department.id,domain);
        result.push({
          id:`${subjectId}-${String(seq).padStart(4,"0")}`, code:`LAB-${String(seq).padStart(4,"0")}`, title, shortTitle:title, category:subject.name, estimatedTime:"30 min", difficulty:index<2?"Beginner":index<4?"Intermediate":"Advanced", status:"Available",
          objective:`Investigate and document ${title.toLowerCase()} using the LabMind workflow.`,
          theory:`Study the principles, procedure, variables, observations and interpretation associated with ${title}.`,
          apparatus:[], booleanEquations:[], icPackages:[], truthTableSpec:{inputs:[],outputs:[],rows:[]}, schematicSvgType:"generic",
          commonMistakes:["Skipping preparation","Incomplete observations","Confusing expected and observed results"],
          learningObjectives:["Understand the core concept","Perform or simulate the procedure","Interpret the result"],
          departmentId:department.id, department:department.name, subjectId, subject:subject.name, moduleId, module:moduleName, catalogStatus:"CATALOG", engineType:engine.engineType, capabilities:engine.capabilities, semester:"Institution configurable", learningMode:engine.learningMode,
        } as LabCatalogExperiment); seq+=1;
      });
    }
  }
  return result;
})();
export const LABMIND_CATALOG_SIZE=catalogExperiments.length;
