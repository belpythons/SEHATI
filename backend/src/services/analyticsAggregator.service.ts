export const analyticsAggregator = {
  async aggregateRiskScores(records: any[]) {
    const total = records.length;
    if (total === 0) return {};

    const tierCounts = records.reduce(
      (acc, record) => {
        acc[record.riskTier] = (acc[record.riskTier] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const avgRiskScore =
      records.reduce((sum, r) => sum + (r.riskScore ?? 0), 0) / total;

    return {
      totalRecords: total,
      riskTierDistribution: tierCounts,
      averageRiskScore: parseFloat(avgRiskScore.toFixed(3)),
      stuntingRate: tierCounts["HIGH"] ? (tierCounts["HIGH"] / total) * 100 : 0,
    };
  },
};