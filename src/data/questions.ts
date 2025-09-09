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
    layout: 'radio-list',
    options: [
      { id: 'high_risk', label: 'High — I take bold bets for potentially high returns' },
      { id: 'moderate_high', label: 'Moderate-High — I\'m comfortable with calculated risks for upside' },
      { id: 'moderate_low', label: 'Moderate-Low — I focus on stability while seeking some growth' },
      { id: 'low_risk', label: 'Low — I prioritize capital preservation and predictable outcomes' },
    ],
  },
  {
    id: 'tech_adoption',
    title: 'When a new technology emerges in the market, how do you respond?',
    layout: 'radio-list',
    options: [
      { id: 'disruptor', label: 'Disruptor — I implement as soon as possible' },
      { id: 'strategic_tester', label: 'Strategic tester — I run pilots before scaling' },
      { id: 'measured_observer', label: 'Measured observer — I wait for proven industry cases' },
      { id: 'cautious_adopter', label: 'Cautious adopter — I only move when it\'s the established standard' },
    ],
  },
  {
    id: 'team_dynamics',
    title: 'When working with portfolio company teams, what\'s your default style?',
    layout: 'radio-list',
    options: [
      { id: 'hands_on', label: 'Hands-on — I directly guide execution and decisions' },
      { id: 'collaborative', label: 'Collaborative — I work side-by-side with leadership teams' },
      { id: 'advisory', label: 'Advisory — I provide insights and let teams implement' },
      { id: 'delegative', label: 'Delegative — I trust management to run operations independently' },
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
