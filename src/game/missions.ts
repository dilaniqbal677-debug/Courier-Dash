export type MissionType = 'deliver_packages' | 'run_distance';

export interface DailyMission {
  id: string;
  type: MissionType;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export const generateDailyMissions = (): DailyMission[] => {
  return [
    {
      id: 'm1',
      type: 'deliver_packages',
      description: 'Antar 5 paket',
      target: 5,
      progress: 0,
      reward: 100,
      completed: false,
      claimed: false,
    },
    {
      id: 'm2',
      type: 'run_distance',
      description: 'Lari 500 meter',
      target: 500,
      progress: 0,
      reward: 150,
      completed: false,
      claimed: false,
    },
    {
      id: 'm3',
      type: 'deliver_packages',
      description: 'Antar 10 paket',
      target: 10,
      progress: 0,
      reward: 250,
      completed: false,
      claimed: false,
    },
  ];
};
