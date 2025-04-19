const Match = require('../models/Match');
const mongoose = require('mongoose');

// GET /standings/tournament/:tournamentId
exports.getStandings = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    // Aggregate wins, draws, losses, points per club
    const pipeline = [
      { $match: { tournament: mongoose.Types.ObjectId(tournamentId), status: 'completed' } },
      { $project: {
          homeTeam: 1, awayTeam: 1,
          homeGoals: '$score.home', awayGoals: '$score.away'
      }},
      { $facet: {
          homeResults: [
            { $project: {
                team: '$homeTeam',
                gf: '$homeGoals', ga: '$awayGoals',
                win: { $cond: [ { $gt: ['$homeGoals','$awayGoals'] }, 1, 0 ] },
                draw: { $cond: [ { $eq: ['$homeGoals','$awayGoals'] }, 1, 0 ] },
                loss: { $cond: [ { $lt: ['$homeGoals','$awayGoals'] }, 1, 0 ] }
            }}
          ],
          awayResults: [
            { $project: {
                team: '$awayTeam',
                gf: '$awayGoals', ga: '$homeGoals',
                win: { $cond: [ { $gt: ['$awayGoals','$homeGoals'] }, 1, 0 ] },
                draw: { $cond: [ { $eq: ['$awayGoals','$homeGoals'] }, 1, 0 ] },
                loss: { $cond: [ { $lt: ['$awayGoals','$homeGoals'] }, 1, 0 ] }
            }}
          ]
      }},
      // merge both arrays
      { $project: {
          all: { $concatArrays: ['$homeResults','$awayResults'] }
      }},
      { $unwind: '$all' },
      // sum by team
      { $group: {
          _id: '$all.team',
          played: { $sum: 1 },
          wins:   { $sum: '$all.win' },
          draws:  { $sum: '$all.draw' },
          losses: { $sum: '$all.loss' },
          goalsFor:   { $sum: '$all.gf' },
          goalsAgainst: { $sum: '$all.ga' }
      }},
      { $addFields: {
          points: { $add: [ { $multiply: ['$wins',3] }, '$draws' ] },
          goalDifference: { $subtract: ['$goalsFor','$goalsAgainst'] }
      }},
      { $sort: { points: -1, goalDifference: -1, goalsFor: -1 } },
      { $lookup: {
          from: 'clubs', localField: '_id', foreignField: '_id', as: 'club'
      }},
      { $unwind: '$club' },
      { $project: {
          club: { _id: 1, name: 1 },
          played: 1, wins:1, draws:1, losses:1, goalsFor:1, goalsAgainst:1, goalDifference:1, points:1
      }}
    ];

    const standings = await Match.aggregate(pipeline);
    res.json(standings);
  } catch (err) { next(err); }
};
