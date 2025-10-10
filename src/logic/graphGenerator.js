// graphGenerator.js — Mock roadmap generator
// Dependencies: none

// REGION: API
export async function generateRoadmap(goal) {
  const nodes = [
    { id: 'DES-FOUND', label: 'Design Foundations', group: 'Design', difficulty: 1, status: 'complete' },
    { id: 'UX-RESEARCH', label: 'UX Research Basics', group: 'UX', difficulty: 2, status: 'in_progress' },
    { id: 'UX-WIREFRAME', label: 'Wireframing', group: 'UX', difficulty: 2, status: 'incomplete' },
    { id: 'UX-TEST', label: 'Usability Testing', group: 'UX', difficulty: 3, status: 'incomplete' },

    { id: 'FE-HTML', label: 'HTML Essentials', group: 'Frontend', difficulty: 1, status: 'complete' },
    { id: 'FE-CSS', label: 'CSS Layouts', group: 'Frontend', difficulty: 2, status: 'in_progress' },
    { id: 'FE-JS', label: 'JavaScript Fundamentals', group: 'Frontend', difficulty: 2, status: 'in_progress' },
    { id: 'FE-REACT', label: 'React Basics', group: 'Frontend', difficulty: 3, status: 'incomplete' },

    { id: 'LEAD-COMM', label: 'Communication Skills', group: 'Leadership', difficulty: 1, status: 'incomplete' },
    { id: 'LEAD-TEAM', label: 'Team Collaboration', group: 'Leadership', difficulty: 2, status: 'incomplete' }
  ];

  const links = [
    { source: 'DES-FOUND', target: 'UX-RESEARCH', type: 'prereq' },
    { source: 'UX-RESEARCH', target: 'UX-WIREFRAME', type: 'prereq' },
    { source: 'UX-WIREFRAME', target: 'UX-TEST', type: 'prereq' },

    { source: 'FE-HTML', target: 'FE-CSS', type: 'prereq' },
    { source: 'FE-CSS', target: 'FE-JS', type: 'prereq' },
    { source: 'FE-JS', target: 'FE-REACT', type: 'prereq' },

    { source: 'UX-WIREFRAME', target: 'FE-REACT', type: 'related' },
    { source: 'UX-TEST', target: 'FE-REACT', type: 'related' },
    { source: 'DES-FOUND', target: 'FE-HTML', type: 'related' },
    { source: 'FE-CSS', target: 'UX-WIREFRAME', type: 'related' },
    { source: 'UX-RESEARCH', target: 'FE-JS', type: 'related' },

    { source: 'LEAD-COMM', target: 'LEAD-TEAM', type: 'prereq' },
    { source: 'LEAD-TEAM', target: 'FE-REACT', type: 'related' },
    { source: 'LEAD-COMM', target: 'UX-TEST', type: 'related' }
  ];

  return { nodes, links };
}

