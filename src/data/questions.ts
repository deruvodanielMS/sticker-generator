import type { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'decision_making',
    title: 'When evaluating a potential investment, how do you typically approach decision-making?',
    layout: 'icons',
    options: [
      { id: 'fully_data_driven', label: 'Analytical', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/a401344c9969a5d400f54f55c2592626ea2c0298?width=150' },
      { id: 'mostly_data_instinct', label: 'Intuitive', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/0ac811bd05f6ddc8bf847ddb3489b5c2754116e8?width=150' },
      { id: 'balanced_mix', label: 'Collaborative', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/99cb3257a361ef479d90e8b0e558ef7cf2d532af?width=150' },
      { id: 'primarily_intuition', label: 'Opportunistic', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/e289af3638361847320c030d3370ce41e910bb8d?width=150' },
    ],
  },
  {
    id: 'risk_appetite',
    title: 'When considering a new opportunity, what best describes your risk tolerance?',
    layout: 'dial',
    options: [
      { id: 'low', label: 'Low', value: 0 },
      { id: 'medium', label: 'Medium', value: 50 },
      { id: 'high', label: 'High', value: 100 },
    ],
  },
  {
    id: 'tech_adoption',
    title: 'When a new technology emerges in the market, how do you respond?',
    layout: 'radio-list',
    options: [
      { id: 'conservative', label: 'Conservative' },
      { id: 'experimental', label: 'Experimental' },
      { id: 'early_adopter', label: 'Early adopter' },
      { id: 'disruptive', label: 'Disruptive' },
    ],
  },
  {
    id: 'team_dynamics',
    title: 'When working with portfolio company teams, what\'s your default style?',
    layout: 'icons',
    options: [
      { id: 'independent', label: 'Independent', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/07bc8535d78138efef9d77a8db3b62907525c1e7?width=150' },
      { id: 'team_player', label: 'Team player', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/8fb194a4000ebffa552aa2939002a52b3c5b7a93?width=150' },
      { id: 'networker', label: 'Networker', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/d50eed6283dfd5b3aeca7fe04f7541b5a9b40e10?width=150' },
      { id: 'xfunctional_lead', label: 'Cross-functional leader', icon: 'https://api.builder.io/api/v1/image/assets/TEMP/164e51f9e7d3f94218adc5720da7c1485c3c90e4?width=150' },
    ],
  },
  {
    id: 'growth_priorities',
    title: 'When defining a growth plan for a portfolio company, which area do you prioritize first?',
    layout: 'radio-list',
    options: [
      { id: 'operational_efficiency', label: 'Operational efficiency and cost optimization' },
      { id: 'market_expansion', label: 'Market expansion and revenue growth' },
      { id: 'innovation_product', label: 'Innovation and product development' },
      { id: 'talent_leadership', label: 'Talent and leadership team strengthening' },
    ],
  },
];
