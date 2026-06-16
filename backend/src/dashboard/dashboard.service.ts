import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Incident, IncidentDocument, IncidentStatus } from '../incidents/schemas/incident.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Incident.name) private incidentModel: Model<IncidentDocument>,
  ) {}

  async getSummary() {
    const [openCount, bySeverity, recentlyClosed, meanResolution] = await Promise.all([
      // Open incident count
      this.incidentModel.countDocuments({ status: IncidentStatus.Open }),

      // Incidents grouped by severity
      this.incidentModel.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // 5 most recently closed incidents
      this.incidentModel
        .find({ status: IncidentStatus.Closed })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title severity updatedAt'),

      // Mean resolution time (endTime - startTime) in minutes
      this.incidentModel.aggregate([
        { $match: { startTime: { $exists: true }, endTime: { $exists: true } } },
        {
          $project: {
            durationMinutes: {
              $divide: [{ $subtract: ['$endTime', '$startTime'] }, 60000],
            },
          },
        },
        { $group: { _id: null, meanResolutionMinutes: { $avg: '$durationMinutes' } } },
      ]),
    ]);

    return {
      openCount,
      bySeverity,
      recentlyClosed,
      meanResolutionMinutes: meanResolution[0]?.meanResolutionMinutes ?? null,
    };
  }
}
