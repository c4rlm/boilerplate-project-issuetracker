const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // test Case 1: Create an issue with every field
  let testIssueId;
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Fix error in posting data',
        issue_text: 'When we post data test has an error.',
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: 'Joe',
        assigned_to: 'Joe',
        open: true,
        status_text: 'In QA'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'open');
        assert.property(res.body, 'status_text');
        testIssueId = res.body._id;
        done();
      });
  });

  // test Case 2: Create an issue with only required fields
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Creator'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        done();
      });
  });

  // test Case 3: Create an issue with missing required fields
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_text: 'When we post data test has an error.'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // test Case 4: View issues on a project
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // test Case 5: View issues on a project with one filter
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true }) // Filter by open issues
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // test Case 6: View issues on a project with multiple filters
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true, created_by: 'Joe' }) // Filter by open issues created by 'Joe'
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // test Case 7: Update one field on an issue
  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testIssueId, issue_title: 'Updated Title' }) // Replace 'valid_issue_id' with a valid ID
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.property(res.body, '_id');
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  // test Case 8: Update multiple fields on an issue
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ 
        _id: testIssueId, 
        issue_text: 'Updated issue text', 
        status_text: 'In Development' 
      }) // Replace 'valid_issue_id' with a valid ID
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.property(res.body, '_id');
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  // test Case 9: Update an issue with missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ issue_text: 'Updated issue text' }) // Do not provide _id
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // test Case 10: Update an issue with no fields to update
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'valid_issue_id' }) // Provide valid _id but no update fields
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // test Case 11: Update an issue with an invalid _id
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'invalid_id', issue_text: 'Updated issue text' }) // Provide invalid _id
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  // test Case 12: Delete an issue
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testIssueId }) // Replace 'valid_issue_id' with a valid ID
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.property(res.body, '_id');
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  // test Case 13: Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalid_id' }) // Provide invalid _id
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  // test Case 14: Delete an issue with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({}) // Do not provide _id
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});