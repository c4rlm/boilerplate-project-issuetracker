'use strict';

const mongoose = require('mongoose');
const { Schema, Types: { ObjectId }  } = mongoose;

// Define el esquema y modelo de Mongoose dentro del mismo archivo
const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: { type: String, required: true }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function(app) {

  app.route('/api/issues/:project')
    .get(async function(req, res) {
      const project = req.params.project;
      const filters = { project, ...req.query };

      try {
        const issues = await Issue.find(filters);
        res.json(issues);
      } catch (err) {
        res.send(err);
      }
    })
    .post(async function(req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        project
      });

      try {
        const issue = await newIssue.save();
        res.json(issue);
      } catch (err) {
        res.send(err);
      }
    })
    .put(async function(req, res) {
      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      updates.updated_on = new Date();

      try {
        const issue = await Issue.findByIdAndUpdate(_id, updates, { new: true });
        if (!issue) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    .delete(async function(req, res) {
      const _id = req.body._id;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const issue = await Issue.findOneAndDelete({ _id });
        if (!issue) {
          return res.json({ error: 'could not delete', _id });
        }
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
        //res.json({ error: 'could not delete', _id, message: err.message });
      }
    });
};