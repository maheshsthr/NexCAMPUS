import Notice from '../models/Notice.js';
import Event from '../models/Event.js';
import Complaint from '../models/Complaint.js';

export const getDashboard = async (req, res, next) => {
  try {
    const college_id = req.user.college_id || '';
    const userId = req.user._id;
    const match = college_id ? { college_id } : {};
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [
      totalNotices,
      upcomingEvents,
      complaintCounts,
      recentNotices,
      upcomingEventsList,
    ] = await Promise.all([
      Notice.countDocuments(match),
      Event.countDocuments({ ...match, date: { $gte: today } }),
      Complaint.aggregate([
        {
          $match: req.user.role === 'Student'
            ? { created_by: userId }
            : match,
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Notice.find(match)
        .populate('created_by', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Event.find({ ...match, date: { $gte: today } })
        .sort({ date: 1 })
        .limit(5)
        .lean(),
    ]);

    const complaintSummary = {
      pending: 0,
      'in-progress': 0,
      resolved: 0,
      total: 0,
    };
    complaintCounts.forEach((c) => {
      complaintSummary[c._id] = c.count;
      complaintSummary.total += c.count;
    });

    res.json({
      stats: {
        totalNotices,
        upcomingEvents,
        pendingComplaints: complaintSummary.pending,
        inProgressComplaints: complaintSummary['in-progress'],
        resolvedComplaints: complaintSummary.resolved,
        totalComplaints: complaintSummary.total,
      },
      recentNotices,
      upcomingEvents: upcomingEventsList,
    });
  } catch (error) {
    next(error);
  }
};
