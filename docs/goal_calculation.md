Looking at the goal calculation logic in the codebase, I'll explain how goals and their progress are calculated based on the implementation in the goalStore.ts:

The goal calculation has several key components:

    Goal Progress Calculation

calculateProgress: (goalId) => {
  const { goals } = get();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal?.solutions?.length) return 0;

  // Calculate weighted progress across all contributing solutions
  const totalWeight = goal.solutions.reduce((sum, s) => sum + s.contributionWeight, 0);
  const weightedProgress = goal.solutions.reduce((sum, solution) => {
    const metrics = Object.values(solution.metrics);
    if (!metrics.length) return sum;

    // Calculate average progress across all metrics for this solution
    const metricProgress = metrics.reduce((mSum, metric) => {            
      let progress;            
      if (metric.direction === 'decrease') {
        // For decreasing metrics (like latency, error rate)
        const range = Math.max(metric.current, metric.target) - metric.target;
        const improvement = Math.max(0, Math.min(metric.current - metric.target, range));
        const ratio = 1 - (improvement / range);
        progress = Math.min(ratio * 100, 100);
      } else {
        // For increasing metrics (like accuracy, adoption)
        progress = Math.min((metric.current / metric.target) * 100, 100);
      }
      return mSum + progress;
    }, 0) / metrics.length;

    // Update solution's contribution percentage
    solution.contributionPercentage = metricProgress / 100;
    
    // Add weighted contribution to total progress
    return sum + ((metricProgress / 100) * solution.contributionWeight);
  }, 0);

  // Return normalized progress (0-1)
  return Math.min(weightedProgress / totalWeight, 1);
}

Here's how it works:

    Solution Weights
        Each solution has a contributionWeight (0-1) indicating its importance to the goal
        Weights are summed to get totalWeight

    Metric Calculation
        For each solution, metrics are evaluated based on their direction:
            For metrics that should decrease (latency, errors):

const range = Math.max(current, target) - target;
const improvement = Math.max(0, Math.min(current - target, range));
const ratio = 1 - (improvement / range);

For metrics that should increase (accuracy, adoption):

            progress = Math.min((current / target) * 100, 100);

    Progress Aggregation
        Each solution's metrics are averaged
        The average is multiplied by the solution's weight
        All weighted contributions are summed
        Final progress is normalized to 0-1 range

    Contribution Tracking
        Each solution stores its contributionPercentage
        This shows how much each solution is contributing to the goal

Example:

const goal = {
  solutions: [
    {
      contributionWeight: 0.6,
      metrics: {
        accuracy: { current: 90, target: 95, direction: 'increase' },
        latency: { current: 120, target: 100, direction: 'decrease' }
      }
    },
    {
      contributionWeight: 0.4,
      metrics: {
        adoption: { current: 80, target: 100, direction: 'increase' }
      }
    }
  ]
};

In this example:

    First solution: (90/95 + (1-(120-100)/(120-100)))/2 * 0.6 = ~0.45
    Second solution: (80/100) * 0.4 = 0.32
    Total progress = 0.77 or 77%

This calculation ensures that:

    Both increasing and decreasing metrics are handled properly
    Solutions contribute proportionally to their weights
    Progress is capped at 100%
    Each solution's contribution is tracked
