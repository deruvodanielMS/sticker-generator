import type { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'decision_style',
    title: 'Which best describes your approach to making business decisions?',
    layout: 'icons',
    options: [
      { id: 'analytical', label: 'Analytical', icon: 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F326110f362024b59902872639764da83?format=webp&width=800' },
      { id: 'intuitive', label: 'Intuitive', icon: 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2Fa033e10c071a42e19ad172d6988aea79?format=webp&width=800' },
      { id: 'collaborative', label: 'Collaborative', icon: 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2F734d99d9b7254347863862923d3961aa?format=webp&width=800' },
      { id: 'opportunistic', label: 'Opportunistic', icon: 'https://cdn.builder.io/api/v1/image/assets%2Fae236f9110b842838463c282b8a0dfd9%2Ff37d8c00cdd648fa870715933cd5e8d0?format=webp&width=800' },
    ],
  },
  {
    id: 'innovation',
    title: 'Which mindset do you most identify with when new technologies emerge?',
    layout: 'radio-list',
    options: [
      { id: 'conservative', label: 'Conservative' },
      { id: 'experimental', label: 'Experimental' },
      { id: 'early_adopter', label: 'Early adopter' },
      { id: 'disruptive', label: 'Disruptive' },
    ],
  },
  {
    id: 'risk',
    title: 'With new opportunities, how would you describe your risk tolerance?',
    layout: 'dial',
    options: [
      { id: 'low', label: 'Low', value: 0 },
      { id: 'medium', label: 'Medium', value: 50 },
      { id: 'high', label: 'High', value: 100 },
    ],
  },
  {
    id: 'collaboration',
    title: 'Collaboration style',
    options: [
      { id: 'independent', label: 'Independent' },
      { id: 'team_player', label: 'Team Player' },
      { id: 'networker', label: 'Networker' },
      { id: 'xfunctional_lead', label: 'Cross-functional Leader' },
    ],
  },
  {
    id: 'vision',
    title: 'Primary focus',
    options: [
      { id: 'operational_efficiency', label: 'Operational Efficiency' },
      { id: 'market_trends', label: 'Market Trends' },
      { id: 'tech_adoption', label: 'Technology Adoption' },
      { id: 'industry_transformation', label: 'Industry Transformation' },
    ],
  },
];
