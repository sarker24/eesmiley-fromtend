const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLivedAccessTokenCustomerAsInteger = app.get('testLongLivedAccessTokenCustomerAsInteger');
const longLivedAccessTokenNoCustomer = app.get('testLongLivedAccessTokenNoCustomer');
const longLivedAccessTokenCustomerId11 = app.get('testLongLivedAccessTokenCustomerId11');
const longLivedAccessTokenCustomerId6767 = app.get('testLongLivedAccessTokenCustomerId6767');
const longLivedAccessTokenCustomerId2 = app.get('testLongLivedAccessTokenCustomerId2');

const moment = require('moment');

describe('projects endpoint', () => {

  it('should get all projects', async () => {
    const res = await chakram.request('GET', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(20);
  });

  it('should find projects by name', async () => {
    const res = await chakram.request('GET', '/projects?name=Project 2', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(1);
  });

  it('should get a project', async () => {
    const res = await chakram.request('GET', '/projects/10001', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('period')).to.equal(true);
    expectChakram(res.body.period).to.equal(1);
  });

  it('should be able to create a project', async () => {
    const res = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10001
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "userId": "1",
        "customerId": "1"
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(res.body.hasOwnProperty('period')).to.equal(true);
    expectChakram(res.body.period).to.equal(1);
  });

  it('should be able to create a project with a parentProject', async () => {

    const res0 = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId2
      },
      'body': {
        "name": "Project Name",
        "parentProjectId": 10018,
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "userId": "1",
        "customerId": "1"
      }
    });

    expectChakram(res0).to.have.status(201);
    expectChakram(res0).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res0.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(res0.body.period).to.equal(2);

    const id = res0.body.id;

    const res2 = await chakram.request('GET', '/projects/10018', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId2
      }
    });

    expectChakram(res2.body.period).to.equal(2);
    expectChakram(res2.body.followUpProjects.length).to.equal(1);
    expectChakram(res2.body.followUpProjects[0].id).to.equal(id);

  });

  it('should be able to create a project where the period changes multiple times', async () => {

    const res0 = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId2
      },
      'body': {
        "name": "Project Name",
        "parentProjectId":10018,
        "duration": {
          "days": 1,
          "type": "REGISTRATIONS"
        },
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "userId": "1",
        "customerId": "1"
      }
    });

    expectChakram(res0).to.have.status(201);
    expectChakram(res0).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res0.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(res0.body.period).to.equal(2);
    expectChakram(res0.body.status).to.equal("PENDING_START");

    const followUpId0 = res0.body.id;
    await chakram.request('PATCH', `/projects/${followUpId0}`, {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId2
      },
      'body': [
        {
          'op': 'replace',
          'path': '/status',
          'value': 'ON_HOLD'
        }
      ]
    });

    const res1 = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId2
      },
      'body': {
        "name": "Project Name",
        "parentProjectId": 10018,
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [],
        "actions": [],
        "userId": "1",
        "customerId": "1"
      }
    })

    expectChakram(res1).to.have.status(201);
    expectChakram(res1).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res1.body.hasOwnProperty('id')).to.equal(true);

    const followUpId1 = res1.body.id;
    const res4 = await chakram.request('GET', '/projects/10018', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId2
      }
    });

    expectChakram(res4.body.period).to.equal(3);
    expectChakram(res4.body.followUpProjects.length).to.equal(2);
    expectChakram(res4.body.followUpProjects[0].id).to.equal(followUpId0);
    expectChakram(res4.body.followUpProjects[1].id).to.equal(followUpId1);
    expectChakram(res4.body.followUpProjects[0].period).to.equal(2);
    expectChakram(res4.body.followUpProjects[1].period).to.equal(3);
  });

  it('should be able to patch a project using replace', async () => {
    const res = await chakram.request('PATCH', '/projects/10001', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/registrationPoints/0",
        "value": { id: 10057 }
      }]
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.registrationPoints.some(point => point.id === 10057)).to.equal(true);
  });

  it('should be able to patch a project using add', async () => {
    const res = await chakram.request('PATCH', '/projects/10001', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "add",
        "path": "/registrationPoints/-",
        "value": { id: 10000 }
      }]
    });

    const registrationPoints = res.body.registrationPoints;
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(registrationPoints.some(point => point.id === 10000)).to.equal(true);
  });

  it('should be able to patch a project using remove', async () => {
    const res = await chakram.request('PATCH', '/projects/10001', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "remove",
        "path": "/registrationPoints/1"
      }]
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
  });

  it('should get all projects if a JWT with customerID as integer is used', async () => {
    const res = await chakram.request('GET', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(20)
  });

  it('should be able to create a project if a JWT with customerID as integer is used', async () => {
    const res = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ]
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
  });

  it('Should fail creating a project if no customerId is provided in accessToken payload', async () => {
    const res = await chakram.request('POST', '/projects', {
      'body': {
        "parentProjectId": "1",
        "name": "Project Name 2",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ]
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNoCustomer
      }
    });

    expectChakram(res).to.have.status(401);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.errorCode).to.equal('E029');
  });

  it('Should be able to get registrations for a given project and its child project', async () => {
    const res = await chakram.request('GET', '/projects/10036/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(6)
  });

  it('Should be able to get registrations for a given project and its child project returning the project object', async () => {
    const res = await chakram.request('GET', '/projects/10036/registrations/?includeProject=true', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.registrations.length).to.equal(2);
    expectChakram(res.body.followUpProjects.length).to.equal(1);
    expectChakram(res.body.followUpProjects[0].registrations.length).to.equal(4);
  });

  it('Should get a project with its followUp projects', async () => {
    const res = await chakram.request('GET', '/projects/10008', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.followUpProjects.length).to.equal(1);
  });

  it('Should get a project with its followUp projects for find', async () => {
    const res = await chakram.request('GET', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.some(project => project.followUpProjects.length > 0)).to.equal(true);
  });

  it('Should start a project with duration REGISTRATIONS', async () => {
    const res0 = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const reg = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": "2017-03-13",
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    const res = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.status).to.equal('RUNNING');
  });

  it('Should start a project with duration CALENDAR', async () => {
    const res = await chakram.request('GET', '/projects/10012', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.status).to.equal('RUNNING');
  });

  it('Should not set project status when doing MORE registrations TODAY for a RUNNING project', async () => {
    await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": "2017-03-14",
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": moment().format('YYYY-MM-DD'),
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    const res = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.status).to.equal('RUNNING');

    await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": moment().format('YYYY-MM-DD'),
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    const res2 = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res2).to.have.status(200);
    expectChakram(res2).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res2.body.status).to.equal('RUNNING');
  });

  it('Should set to PENDING_INPUT a project with duration REGISTRATIONS', async () => {

    const initialRes = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const reg1 = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": "2017-03-14",
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    const reg2 = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": "2017-03-15",
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    const reg3 = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": "2017-03-16",
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    const resultRes = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(initialRes.body.percentage).to.equal(0);
    expectChakram(resultRes).to.have.status(200);
    expectChakram(resultRes).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(resultRes.body.percentage).to.equal(100);
    expectChakram(resultRes.body.duration.days).to.equal(3);
    expectChakram(resultRes.body.registrationPoints.length).to.equal(5);
    expectChakram(resultRes.body.status).to.equal('PENDING_INPUT');
  });

  it('Should set to PENDING_INPUT a project with duration CALENDAR', async () => {
    const resPost = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        parentProjectId: null,
        name: "Proyecto whatever CALENDAR 2",
        userId: 1,
        customerId: 1,
        duration: {
          type: "CALENDAR",
          start: 1491000010,
          end: 1491000011
        },
        status: "PENDING_START",
        active: true,
        registrationPoints: [
          {
            id: 10059
          }
        ],
        actions: []

      }
    });

    const res = await chakram.request('GET', `/projects/${resPost.body.id}`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.status).to.equal('PENDING_INPUT');
  });

  it('Should set to PENDING_FOLLOWUP a project', async () => {
    const res = await chakram.request('PATCH', '/projects/10014', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        op: 'replace',
        path: '/actions',
        value: [{
          id: 10000,
          name: 'Useless action'
        }]
      }]
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.status).to.equal('PENDING_FOLLOWUP');
  });

  it('Should set to RUNNING_FOLLOWUP a project', () => {
    /*
     * PATCH PARENT TO MAKE IT CHANGE INTO PENDING_FOLLOWUP
     */
    return chakram.request('PATCH', '/projects/10014', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        op: 'replace',
        path: '/actions',
        value: [{
          id: 10000,
          name: 'Useless action'
        }]
      }]
    })
      .then(() => {
        return chakram.request('POST', '/projects', {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          },
          'body': {
            parentProjectId: 10014,
            name: "Proyecto FOLLOWUP 2",
            userId: 1,
            customerId: 1,
            duration: {
              type: "CALENDAR",
              start: 1491000010,
              end: 4000000000
            },
            status: "PENDING_START",
            active: true,
            registrationPoints: [
              {
                id: 10059
              }
            ],
            actions: []

          }
        });
      })
      .then((res) => {
        /*
         * GET CHILD TO MAKE IT CHANGE TO RUNNING STATUS
         */
        return chakram.request('GET', `/projects/${res.body.id}`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        })
      })
      .then((res) => {
        /*
         * GET CHILD TO MAKE IT CHANGE TO RUNNING_FOLLOWUP STATUS
         */
        return chakram.request('GET', '/projects/10014', {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        })
      })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
        expectChakram(res.body.status).to.equal('RUNNING_FOLLOWUP');
      });

  });

  it('Should prevent creating a followUp for a project with status != PENDING_FOLLOWUP', () => {
    return chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "parentProjectId": 10014,
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "userId": "1",
        "customerId": "1"
      }
    })
      .then((res) => {
        expectChakram(res).to.have.status(500);
        expectChakram(res.body.errorCode).to.equal('E161');
      });
  });

  it('Should prevent creating MULTIPLE followUp for the same project', () => {
    return chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "parentProjectId": 10000,
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10020
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "userId": "1",
        "customerId": "1"
      }
    })
      .then((res) => {
        expectChakram(res).to.have.status(400);
        expectChakram(res.body.errorCode).to.equal('E160');
      });
  });

  it('should not be able to change status of a followup project through patch IF THERE ARE OTHER RUNNING FOLLOWUPS', () => {
    return chakram.request('PATCH', '/projects/10029', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'RUNNING'
      }]
    }).then((res) => {
      expectChakram(res).to.have.status(400);
      expectChakram(res.body.errorCode).to.equal('E160');
    });
  });

  it('should be able to change status of a followup project through patch IF THERE ARE not OTHER RUNNING FOLLOWUPS', () => {
    return chakram.request('PATCH', '/projects/10003', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'RUNNING'
      }]
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.status).to.equal('RUNNING');
    });
  });

  it('should calculate percentage for project with duration CALENDAR', () => {
    return chakram.request('GET', '/projects/10012', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      const project = res.body;
      const totalDurationOfProject = project.duration.end - project.duration.start;
      const elapsedTimeProject = moment().unix() - project.duration.start;
      const percentage = Math.round((elapsedTimeProject * 100) / totalDurationOfProject);

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(project.percentage).to.equal(percentage);
    });
  });

  it('should calculate percentage for project with duration REGISTRATIONS', async () => {

    const projectRes = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(projectRes.body.duration.type).to.equal("REGISTRATIONS");
    expectChakram(projectRes.body.percentage).to.equal(0);

    const startDate = moment.unix(projectRes.body.duration.start);

    await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": startDate.add(1,'days').format('YYYY-MM-DD'),
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });

    await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "date": startDate.add(2,'days').format('YYYY-MM-DD'),
        "currency": "DKK",
        "amount": 3500,
        "unit": "kg",
        "manual": true,
        "registrationPointId": 10058
      }
    });


    const result = await chakram.request('GET', '/projects/10010', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(result).to.have.status(200);
    expectChakram(result).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(result.body.percentage).to.equal(67);
  });

  it('Should change parent to ON_HOLD when all its children has been set to ON_HOLD', () => {
    return chakram.request('PATCH', '/projects/10003', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'ON_HOLD'
      }]
    })
      .then(() => {
        return chakram.request('GET', '/projects/10000', {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
        expectChakram(res.body.status).to.equal('ON_HOLD');
      });
  });

  it('Should change parent to PENDING_FOLLOWUP when all its children has been set to PENDING_START', () => {
    return chakram.request('PATCH', '/projects/10003', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'PENDING_START'
      }]
    })
      .then(() => {
        return chakram.request('GET', '/projects/10000', {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
        expectChakram(res.body.status).to.equal('PENDING_FOLLOWUP');
      });
  });

  it('Should change parent to RUNNING_FOLLOWUP when all its children has been set to RUNNING', () => {
    return chakram.request('PATCH', '/projects/10003', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'RUNNING'
      }]
    })
      .then(() => {
        return chakram.request('GET', '/projects/10000', {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
        expectChakram(res.body.status).to.equal('RUNNING_FOLLOWUP');
      });
  });

  it('Should change status to PENDING_FOLLOWUP when parent is ON_HOLD after creating followup', () => {
    return chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "parentProjectId": 10015,
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10000
          },
          {
            "id": 10057
          }
        ],
        "actions": [
          {
            "id": 1,
            "name": "Use smaller plates"
          },
          {
            "id": 2,
            "name": "Use napkins with drawings"
          }
        ],
        "userId": "1",
        "customerId": "1"
      }
    })
      .then((res) => {
        expectChakram(res).to.have.status(201);
        return chakram.request('GET', '/projects/10015', {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
        expectChakram(res.body.status).to.equal('PENDING_FOLLOWUP');
      });
  });

  it('should create a new Action entity record when patching a project with "add" operation and action value w/o "id"', () => {
    const value = {
      name: 'aaaaaaaaaaaaa',
      description: 'asdasdasdasdasdasd'
    };

    return chakram.request('PATCH', '/projects/10015', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: [{
        op: "add",
        path: "/actions/-",
        value
      }]
    })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

        const actions = res.body.actions;

        expectChakram(parseInt(actions[0].id)).to.equal(10007); // NOTE: this ID must equal the ID given in the next .then() check for actions
        expectChakram(actions[0].name).to.equal(value.name);
        expectChakram(actions[0].description).to.equal(value.description);
        expectChakram(parseInt(actions[0].customerId)).to.equal(1);
        expectChakram(parseInt(actions[0].userId)).to.equal(1);
      })
      .then(() => {
        // And finally check that the newly created action exists
        return app.service('actions').get(10007)
          .then((action) => {
            expectChakram(parseInt(action.id)).to.equal(10007);
          });
      });

  });

  it('should create a new Action entity record when patching a project with "replace" operation and action value w/o "id"', () => {
    const value = {
      name: 'aaaaaaaaaaaaa',
      description: 'asdasdasdasdasdasd'
    };

    return chakram.request('PATCH', '/projects/10015', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: [{
        op: "replace",
        path: "/actions/0",
        value
      }]
    })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

        const actions = res.body.actions;

        expectChakram(parseInt(actions[0].id)).to.equal(10007); // NOTE: this ID must equal the ID given in the next .then() check for actions
        expectChakram(actions[0].name).to.equal(value.name);
        expectChakram(actions[0].description).to.equal(value.description);
        expectChakram(parseInt(actions[0].customerId)).to.equal(1);
        expectChakram(parseInt(actions[0].userId)).to.equal(1);
      })
      .then(() => {
        // And finally check that the newly created action exists
        return app.service('actions').get(10007)
          .then((action) => {
            expectChakram(parseInt(action.id)).to.equal(10007);
          });
      });
  });

  it('should update an Action entity record when patching a project with "replace" operation and action value with "id"', () => {
    const value = {
      id: 10005,
      name: 'aaaaaaaaaaaaa',
      description: 'asdasdasdasdasdasd'
    };

    return chakram.request('PATCH', '/projects/10015', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: [{
        op: "replace",
        path: "/actions/0",
        value
      }]
    })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

        const actions = res.body.actions;

        expectChakram(actions[0].name).to.equal(value.name);
        expectChakram(actions[0].description).to.equal(value.description);
        expectChakram(parseInt(actions[0].customerId)).to.equal(1);
        expectChakram(parseInt(actions[0].userId)).to.equal(1);
      });
  });

  it('should create an Action entity record when patching a project with "replace" operation and action value with "id" that does not actually exist', () => {
    const value = {
      id: 99,
      name: 'gagaga',
      description: 'gugugu'
    };

    return chakram.request('PATCH', '/projects/10015', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: [{
        op: "replace",
        path: "/actions/0",
        value
      }]
    })
      .then((res) => {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

        const actions = res.body.actions;
        expectChakram(actions.length).to.equal(1);
        expectChakram(actions.length).to.equal(1);
        expectChakram(parseInt(actions[0].id)).to.equal(10007); // NOTE: this ID must equal the ID given in the next .then() check for actions
        expectChakram(actions[0].name).to.equal(value.name);
        expectChakram(actions[0].description).to.equal(value.description);
        expectChakram(parseInt(actions[0].customerId)).to.equal(1);
        expectChakram(parseInt(actions[0].userId)).to.equal(1);
      })
      .then(() => {
        // And finally check that the newly created action exists
        return app.service('actions').get(10007)
          .then((action) => {
            expectChakram(parseInt(action.id)).to.equal(10007);
          });
      });
  });

  it('Should mark a sibling followup project as FINISHED, if it has status PENDING_FOLLOWUP and another sibling project is created', async () => {
    const resPost = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        parentProjectId: 10016,
        name: "Proyecto whatever followup CALENDAR SIBLING2",
        userId: 1,
        customerId: 1,
        duration: {
          type: "CALENDAR",
          start: 1490000010,
          end: 1900000000
        },
        status: "PENDING_START",
        active: true,
        registrationPoints: [
          {
            id: 10059
          }
        ],
        actions: []

      }
    });
    /*
     * Then we get the sibling to check its status
     */
    expectChakram(resPost).to.have.status(201);

    const res = await chakram.request('GET', '/projects/10017', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.status).to.equal('FINISHED');
  });

  it('Should finish all followUp projects when parent is set to FINISHED', () => {
    return chakram.request('PATCH', '/projects/10028', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'FINISHED'
      }]
    }).then(res => {
      expectChakram(res).to.have.status(200);
      expectChakram(parseInt(res.body.id)).to.equal(10028);
      expectChakram(res.body.status).to.equal('FINISHED');
      expectChakram(res.body.followUpProjects[0].status).to.equal('FINISHED');
      expectChakram(res.body.followUpProjects[1].status).to.equal('FINISHED');
    }).then(() => {
      // projects with ID 10029 and 10030 are followUp projects to 10028
      return app.get('sequelize').models.project.findAll({ where: { id: { $in: [10029, 10030] } } })
        .then(result => {
          result.forEach(followUpProject => {
            expectChakram(followUpProject.status).to.equal('FINISHED');
          });
        });
    });
  });

  it('Should not patch neither parent nor followUps, since the patch value is not "FINISHED"', () => {
    return chakram.request('PATCH', '/projects/10028', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'PENDING_INPUT'
      }]
    }).then(res => {
      expectChakram(res).to.have.status(200);
      expectChakram(parseInt(res.body.id)).to.equal(10028);
      /*
       * parent project status should be changed properly, but followUps should remain with unchanged status
       */
      expectChakram(res.body.status).to.equal('PENDING_INPUT');
      expectChakram(res.body.followUpProjects[0].status).to.equal('ON_HOLD');
      expectChakram(res.body.followUpProjects[1].status).to.equal('RUNNING');
    }).then(() => {
      // projects with ID 10029 and 10030 are followUp projects to 10028
      return app.get('sequelize').models.project.findAll({ where: { id: { $in: [10029, 10030] } } })
        .then(result => {
          result.forEach(followUpProject => {
            if (followUpProject.id === '10029') {
              expectChakram(followUpProject.status).to.equal('ON_HOLD');
            } else {
              expectChakram(followUpProject.status).to.equal('RUNNING');
            }
          });
        });
    });
  });

  it('Should finish just a followUp project', () => {
    return chakram.request('PATCH', '/projects/10030', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/status",
        "value": 'FINISHED'
      }]
    }).then(res => {
      expectChakram(res).to.have.status(200);
      expectChakram(parseInt(res.body.id)).to.equal(10030);
      expectChakram(res.body.status).to.equal('FINISHED');
      expectChakram(res.body.hasOwnProperty('period')).to.equal(true);
      expectChakram(res.body.period).to.equal(1);

      return res.body.parentProjectId;
    }).then((parentProjectId) => {
      // sanity check, that the parent has been set to "ON_HOLD"
      return app.get('sequelize').models.project.findByPk(parentProjectId)
        .then(parentProject => {
          expectChakram(parseInt(parentProject.id)).to.equal(10028);
          expectChakram(parentProject.status).to.equal('ON_HOLD');
        });
    });
  });

  it('Should prevent creating a Project when one of its Products is inactive', async () => {
    const res = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId6767
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10002
          },
          {
            "id": 10006 // inactive
          }
        ],
        "userId": "6767",
        "customerId": "6767"
      }
    });
    expectChakram(res).to.have.status(500);

    const err = res.body;
    expectChakram(err.message).to.equal('Cannot create Project with inactive Registration Points');
    expectChakram(err.errorCode).to.equal('E264');
    expectChakram(err.data.registrationPointIds).to.include(10006);
  });

  it('Should prevent creating a project if registration points have inactive ancestors', async () => {
    const res = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId6767
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "days": 10,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10052
          },
          {
            "id": 10054 // inactive parent
          }
        ],
        "userId": "6767",
        "customerId": "6767"
      }
    });

    expectChakram(res).to.have.status(500);

    const err = res.body;
    expectChakram(err.message).to.equal('Cannot create Project with inactive ancestor Registration Points');
    expectChakram(err.errorCode).to.equal('E175');
    expectChakram(err.data.registrationPointIds).to.deep.equal([10006]);
  });

  it('should be able to create a project with a start date in the past and associate existing registrations to it', async () => {
    const res = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "start": 1493228800, // 2017-04-26
          "end": 1528588800,  // 2018-06-10
          "type": "CALENDAR"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10057
          }
        ],
        "actions": [],
        "userId": "1",
        "customerId": "1"
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);

    const resGet = await chakram.request('GET', `/projects/${res.body.id}/registrations`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
    });

    expectChakram(resGet.body.length).to.equal(4);
  });

  it('should recreate the project_registration relationships when a start/end date is edited in a project', async () => {
    const res = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "start": 1593228800,  // 2020-05-27
          "end": 1528588800,  // 2018-06-10
          "type": "CALENDAR"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10057
          }
        ],
        "actions": [],
        "userId": "1",
        "customerId": "1"
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);

    const resGet1 = await chakram.request('GET', `/projects/${res.body.id}/registrations`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
    });

    expectChakram(resGet1.body.length).to.equal(0);

    await chakram.request('PATCH', `/projects/${res.body.id}`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/duration",
        "value": {
          "start": 1493228800,
          "end": 1496448000,  // 2017-06-03
          "type": "CALENDAR"
        }
      }]
    });

    const resGet2 = await chakram.request('GET', `/projects/${res.body.id}/registrations`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
    });

    expectChakram(resGet2.body.length).to.equal(4);
  });

  it('should recreate the project_registration relationships when registrationPoints are edited in a project duration calendar', async () => {
    await chakram.request('PATCH', `/projects/10037`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/registrationPoints",
        "value": [{
          "id": "10057",
          "name": "Beef"
        }]
      }]
    });

    const res = await chakram.request('GET', `/projects/10037/registrations`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
    });

    expectChakram(res.body.length).equal(1);
    expectChakram(res.body[0].registrationPointId).to.equal('10057');
  });

  it('should recreate the project_registration relationships when registrationPoints are edited in a project duration registrations', async () => {
    const projectResponse = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "name": "Project Name Yo",
        "duration": {
          "start": moment('2017-04-01').unix(),
          "days": 20,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [
          {
            "id": 10057
          }
        ],
        "actions": [],
        "userId": "1",
        "customerId": "1"
      }
    });

    await chakram.request('PATCH', `/projects/${projectResponse.body.id}`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': [{
        "op": "replace",
        "path": "/registrationPoints",
        "value": [{
          "id": "10083",
          "name": "Salmon"
        }]
      }]
    });

    const res = await chakram.request('GET', `/projects/${projectResponse.body.id}/registrations`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
    });

    expectChakram(res.body.length).to.be.greaterThan(2);

    let registrationPointsOk = true;
    for (const reg of res.body) {
      if (reg.registrationPointId !== '10083') {
        registrationPointsOk = false;
      }
    }

    expectChakram(registrationPointsOk).to.equal(true);
  });

  it('Should associate with registrations when creating project with duration REGISTRATIONS and a start date', async () => {
    const startDate = moment('2018-09-01').unix();
    const projectResponse = await chakram.request('POST', '/projects', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "name": "Project Name",
        "duration": {
          "start": startDate,
          "days": 50,
          "type": "REGISTRATIONS"
        },
        "status": "PENDING_START",
        "registrationPoints": [],
        "actions": [],
        "userId": "1",
        "customerId": "1"
      }
    });

    const res = await chakram.request('GET', `/projects/${projectResponse.body.id}/registrations`, {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
    });

    expectChakram(res.body.length).to.equal(9);

    let datesOk = true;
    for (const reg of res.body) {
      if (moment(reg.date, 'YYYY-MM-DD').unix() < startDate) {
        datesOk = false;
      }
    }

    expectChakram(datesOk).to.equal(true);
  });

  it('should create a project_registration relationship when creating a project with no areas or registrationPoints', async () => {
    const resPost = await chakram.request('POST', '/projects', {
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      },
      body: {
        name: "Project to edit with/without registrationPoints or areas",
        duration: { type: 'CALENDAR', start: moment('2017-04-04').unix(), end: moment('2017-04-10').unix() },
        status: 'RUNNING',
        registrationPoints: [],
        actions: [],
        userId: 1,
        customerId: 1,
        active: true
      }
    });

    expectChakram(resPost).to.have.status(201);
    expectChakram(resPost).to.have.header('content-type', 'application/json; charset=utf-8');

    const resGet = await chakram.request('GET', `/projects/${resPost.body.id}/registrations`, {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(resGet.body.length).to.equal(1);
    expectChakram(resGet.body[0].date).to.equal('2017-04-04');
  });

  it('should create a project_registration relationship when creating a project with no registrationPoints', async () => {
    const resPost = await chakram.request('POST', '/projects', {
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      },
      body: {
        name: "Project to edit with/without registrationPoints or areas",
        duration: { type: 'CALENDAR', start: moment('2017-04-04').unix(), end: moment('2017-04-10').unix() },
        status: 'RUNNING',
        registrationPoints: [],
        actions: [{
          id: 10001,
          name: "Kitchen"
        }],
        userId: 1,
        customerId: 1,
        active: true
      }
    });
    expectChakram(resPost).to.have.status(201);
    expectChakram(resPost).to.have.header('content-type', 'application/json; charset=utf-8');

    const resGet = await chakram.request('GET', `/projects/${resPost.body.id}/registrations`, {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(resGet.body.length).to.equal(1);

    await chakram.request('PATCH', `/projects/${resPost.body.id}`, {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: [{
        'op': 'replace',
        'path': '/duration',
        'value': {
          'start': moment('2017-04-01').unix(),
          'end': moment('2017-04-24').unix(),
          'type': 'CALENDAR'
        }
      }]
    });

    const resGet2 = await chakram.request('GET', `/projects/${resPost.body.id}/registrations`, {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(resGet2.body.length).to.equal(3);
    expectChakram(resGet2.body[0].date).to.equal('2017-04-04');
    expectChakram(resGet2.body[1].date).to.equal('2017-04-14');
    expectChakram(resGet2.body[2].date).to.equal('2017-04-24');
  });

  describe('Project Timeline', () => {

    it('Should build a project timeline for a parent project', async () => {
      const res = await chakram.request('GET', `/projects/10036/timeline`, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      expectChakram(res.body.length).to.equal(10);
      expectChakram(res.body[0].period).to.equal(2);
      expectChakram(res.body[0].type).to.equal('action');
      expectChakram(res.body[1].period).to.equal(2);
      expectChakram(res.body[1].type).to.equal('action');
      expectChakram(res.body[2].period).to.equal(2);
      expectChakram(res.body[2].type).to.equal('registration');
      expectChakram(res.body[3].period).to.equal(2);
      expectChakram(res.body[3].type).to.equal('registration');
      expectChakram(res.body[4].period).to.equal(2);
      expectChakram(res.body[4].type).to.equal('registration');
      expectChakram(res.body[5].period).to.equal(2);
      expectChakram(res.body[5].type).to.equal('period');
      expectChakram(res.body[6].period).to.equal(2);
      expectChakram(res.body[6].type).to.equal('registration');
      expectChakram(res.body[7].period).to.equal(1);
      expectChakram(res.body[7].type).to.equal('registration');
      expectChakram(res.body[8].period).to.equal(1);
      expectChakram(res.body[8].type).to.equal('project');
      expectChakram(res.body[9].period).to.equal(1);
      expectChakram(res.body[9].type).to.equal('registration');
    });

    it('Should build a project timeline for a follow up project', async () => {
      const res = await chakram.request('GET', `/projects/10037/timeline`, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      expectChakram(res.body.length).to.equal(7);
      expectChakram(res.body[0].period).to.equal(2);
      expectChakram(res.body[0].type).to.equal('action');
      expectChakram(res.body[1].period).to.equal(2);
      expectChakram(res.body[1].type).to.equal('action');
      expectChakram(res.body[2].period).to.equal(2);
      expectChakram(res.body[2].type).to.equal('registration');
      expectChakram(res.body[3].period).to.equal(2);
      expectChakram(res.body[3].type).to.equal('registration');
      expectChakram(res.body[4].period).to.equal(2);
      expectChakram(res.body[4].type).to.equal('registration');
      expectChakram(res.body[5].period).to.equal(2);
      expectChakram(res.body[5].type).to.equal('period');
      expectChakram(res.body[6].period).to.equal(2);
      expectChakram(res.body[6].type).to.equal('registration');
    });

    it('Should throw error 404 if project does not exist', async () => {
      const res = await chakram.request('GET', `/projects/100360000/timeline`, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(404);
    });

  });

});
