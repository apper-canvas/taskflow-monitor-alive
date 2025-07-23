// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today
      };
    case 'week':
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: weekStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'month':
      const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: monthStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    default:
      return {
        start: new Date(0),
        end: new Date()
      };
  }
};

export const getLeadsAnalytics = async (period = 'all', userId = 'all') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "website_url_c" } },
        { field: { Name: "team_size_c" } },
        { field: { Name: "arr_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "added_by_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      pagingInfo: { limit: 1000, offset: 0 }
    };

    // Add filters based on period and userId
    if (userId !== 'all') {
      params.where = [
        { FieldName: "added_by_c", Operator: "EqualTo", Values: [parseInt(userId)] }
      ];
    }

    if (period !== 'all') {
      const { start, end } = getDateRange(period);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];
      
      const dateFilter = {
        FieldName: "CreatedOn",
        Operator: "RelativeMatch",
        Values: [period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : period === 'week' ? 'last 7 days' : 'last 30 days']
      };

      if (params.where) {
        params.where.push(dateFilter);
      } else {
        params.where = [dateFilter];
      }
    }

    const response = await apperClient.fetchRecords('lead_c', params);

    if (!response.success) {
      console.error("Error fetching leads analytics:", response.message);
      return { leads: [], totalCount: 0 };
    }

    const leads = response.data || [];
    
    return {
      leads: leads.map(lead => ({
        ...lead,
        websiteUrl: lead.website_url_c,
        teamSize: lead.team_size_c,
        arr: lead.arr_c,
        category: lead.category_c,
        status: lead.status_c,
        addedBy: lead.added_by_c?.Id || lead.added_by_c,
        addedByName: lead.added_by_c?.Name || 'Unknown',
        createdAt: lead.CreatedOn
      })),
      totalCount: leads.length
    };
  } catch (error) {
    console.error("Error fetching leads analytics:", error.message);
    return { leads: [], totalCount: 0 };
  }
};

export const getDailyLeadsChart = async (userId = 'all', days = 30) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "CreatedOn" } },
        { field: { Name: "added_by_c" } }
      ],
      where: [
        { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: [`last ${days} days`] }
      ],
      pagingInfo: { limit: 1000, offset: 0 }
    };

    if (userId !== 'all') {
      params.where.push({
        FieldName: "added_by_c", 
        Operator: "EqualTo", 
        Values: [parseInt(userId)]
      });
    }

    const response = await apperClient.fetchRecords('lead_c', params);

    if (!response.success) {
      console.error("Error fetching daily leads chart:", response.message);
      return {
        chartData: [],
        categories: [],
        series: [{ name: 'New Leads', data: [] }]
      };
    }

    const leads = response.data || [];
    const now = new Date();
    const chartData = [];

    // Generate data for the last X days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLeads = leads.filter(lead => {
        const leadDate = lead.CreatedOn?.split('T')[0];
        return leadDate === dateStr;
      });
      
      chartData.push({
        date: dateStr,
        count: dayLeads.length,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return {
      chartData,
      categories: chartData.map(item => item.formattedDate),
      series: [
        {
          name: 'New Leads',
          data: chartData.map(item => item.count)
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching daily leads chart:", error.message);
    return {
      chartData: [],
      categories: [],
      series: [{ name: 'New Leads', data: [] }]
    };
  }
};

export const getLeadsMetrics = async (userId = 'all') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Get metrics for different time periods
    const periods = ['Today', 'Yesterday', 'last 7 days', 'last 30 days'];
    const metrics = {};

    for (const period of periods) {
      const params = {
        fields: [{ field: { Name: "Id", Function: "Count" } }],
        where: [
          { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: [period] }
        ]
      };

      if (userId !== 'all') {
        params.where.push({
          FieldName: "added_by_c", 
          Operator: "EqualTo", 
          Values: [parseInt(userId)]
        });
      }

      const response = await apperClient.fetchRecords('lead_c', params);
      
      if (response.success && response.data) {
        const count = response.data.length || 0;
        const key = period === 'Today' ? 'today' : 
                   period === 'Yesterday' ? 'yesterday' :
                   period === 'last 7 days' ? 'week' : 'month';
        
        metrics[key] = {
          count,
          label: period === 'Today' ? 'Today' : 
                period === 'Yesterday' ? 'Yesterday' :
                period === 'last 7 days' ? 'This Week' : 'This Month'
        };
      }
    }

    // Calculate trend
    const todayCount = metrics.today?.count || 0;
    const yesterdayCount = metrics.yesterday?.count || 0;
    const todayTrend = yesterdayCount === 0 ? 100 : 
      Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

    if (metrics.today) {
      metrics.today.trend = todayTrend;
    }

    return {
      metrics,
      statusDistribution: {},
      categoryDistribution: {},
      totalLeads: 0
    };
  } catch (error) {
    console.error("Error fetching leads metrics:", error.message);
    return {
      metrics: {
        today: { count: 0, trend: 0, label: 'Today' },
        yesterday: { count: 0, label: 'Yesterday' },
        week: { count: 0, label: 'This Week' },
        month: { count: 0, label: 'This Month' }
      },
      statusDistribution: {},
      categoryDistribution: {},
      totalLeads: 0
    };
  }
};

export const getUserPerformance = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Get sales reps
    const salesRepsResponse = await apperClient.fetchRecords('sales_rep_c', {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "leads_contacted_c" } },
        { field: { Name: "meetings_booked_c" } },
        { field: { Name: "deals_closed_c" } },
        { field: { Name: "total_revenue_c" } }
      ],
      pagingInfo: { limit: 100, offset: 0 }
    });

    if (!salesRepsResponse.success) {
      console.error("Error fetching sales reps:", salesRepsResponse.message);
      return [];
    }

    const salesReps = salesRepsResponse.data || [];
    const userStats = [];

    for (const rep of salesReps) {
      // Get lead counts for different periods
      const todayLeads = await apperClient.fetchRecords('lead_c', {
        fields: [{ field: { Name: "Id" } }],
        where: [
          { FieldName: "added_by_c", Operator: "EqualTo", Values: [rep.Id] },
          { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: ['Today'] }
        ]
      });

      const weekLeads = await apperClient.fetchRecords('lead_c', {
        fields: [{ field: { Name: "Id" } }],
        where: [
          { FieldName: "added_by_c", Operator: "EqualTo", Values: [rep.Id] },
          { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: ['last 7 days'] }
        ]
      });

      const monthLeads = await apperClient.fetchRecords('lead_c', {
        fields: [{ field: { Name: "Id" } }],
        where: [
          { FieldName: "added_by_c", Operator: "EqualTo", Values: [rep.Id] },
          { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: ['last 30 days'] }
        ]
      });

      userStats.push({
        Id: rep.Id,
        name: rep.Name,
        totalLeads: rep.leads_contacted_c || 0,
        todayLeads: todayLeads.success ? (todayLeads.data?.length || 0) : 0,
        weekLeads: weekLeads.success ? (weekLeads.data?.length || 0) : 0,
        monthLeads: monthLeads.success ? (monthLeads.data?.length || 0) : 0,
        meetingsBooked: rep.meetings_booked_c || 0,
        dealsClosed: rep.deals_closed_c || 0,
        totalRevenue: rep.total_revenue_c || 0,
        conversionRate: (rep.meetings_booked_c > 0) ? 
          Math.round(((rep.deals_closed_c || 0) / rep.meetings_booked_c) * 100) : 0
      });
    }
    
    return userStats.sort((a, b) => b.totalLeads - a.totalLeads);
  } catch (error) {
    console.error("Error fetching user performance:", error.message);
    return [];
  }
};