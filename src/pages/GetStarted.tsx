import React from 'react';
import { Check, Users, Target, Contact as FileContract, GitBranch, Play, Flag } from 'lucide-react';

interface SetupItemProps {
  title: string;
  description: string;
  icon: React.ElementType;
  isCompleted?: boolean;
  onClick: () => void;
}

const SetupItem = ({ title, description, icon: Icon, isCompleted = false, onClick }: SetupItemProps) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
    <div className="absolute top-6 right-6">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
        ${isCompleted 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200'
        }`}
      >
        {isCompleted && <Check className="w-4 h-4 text-green-500" />}
      </div>
    </div>
    <div className="mb-4">
      <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm
        text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Create {title}
    </button>
  </div>
);

export default function GetStarted() {
  // In a real app, this would come from your state management
  const [completedItems, setCompletedItems] = React.useState<string[]>([]);

  const handleItemClick = (item: string) => {
    setCompletedItems((prev) => [...prev, item]);
  };

  const setupItems = [
    {
      title: 'Goals',
      description: 'Set clear, measurable objectives that guide your initiative\'s impact and track progress over time.',
      icon: Flag,
      isCompleted: completedItems.includes('Goals'),
    },
    {
      title: 'Stakeholders',
      description: 'Connect and collaborate with organizations, sponsors, and contributors driving impact initiatives.',
      icon: Users,
      isCompleted: completedItems.includes('Stakeholders'),
    },
    {
      title: 'Initiatives',
      description: 'Define and manage mission-driven projects aimed at achieving measurable social and environmental impact.',
      icon: Target,
      isCompleted: completedItems.includes('Initiatives'),
    },
    {
      title: 'Contracts',
      description: 'Establish transparent agreements that govern workflows, data exchanges, and accountability within initiatives.',
      icon: FileContract,
      isCompleted: completedItems.includes('Contracts'),
    },
    {
      title: 'Workflows',
      description: 'Automate and track the sequence of actions required to execute and validate impact processes efficiently.',
      icon: GitBranch,
      isCompleted: completedItems.includes('Workflows'),
    },
    {
      title: 'Actions',
      description: 'Perform and verify individual tasks that contribute to the progress and success of your initiative.',
      icon: Play,
      isCompleted: completedItems.includes('Actions'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to ImpactMap
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Let's get you started with the essential components of your impact journey.
          Complete each step to build your first impact mapping project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setupItems.map((item) => (
          <SetupItem
            key={item.title}
            {...item}
            onClick={() => handleItemClick(item.title)}
          />
        ))}
      </div>
    </div>
  );
}