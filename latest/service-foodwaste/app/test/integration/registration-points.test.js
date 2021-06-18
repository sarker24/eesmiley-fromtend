const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLivedAccessTokenCustomerAsInteger = app.get('testLongLivedAccessTokenCustomerAsInteger');
const longLivedAccessTokenNoCustomer = app.get('testLongLivedAccessTokenNoCustomer');
const longLivedAccessTokenCustomerId11 = app.get('testLongLivedAccessTokenCustomerId11');

describe('registration points endpoint', () => {

  it('should get all registration points', async () => {
    const res = await chakram.request('GET', '/registration-points', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(74);
    expectChakram(!res.body[0].bootstrapKey).to.equal(true);
  });

  it('should find registration points by name', async () => {
    const res = await chakram.request('GET', '/registration-points?name=Salmon', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(5);
    expectChakram(res.body[0].cost).to.equal(5000);
  });

  it('should create a root registration point', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'customerId': 1,
          'name': 'Special registration point',
          'userId': 1,
          'cost': 1000,
          'active': true,
          'image': null
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const { id, ...data } = res.body;
    expectChakram(id).to.not.be.null;
    expectChakram(data).to.deep.equal({
      name: 'Special registration point',
      cost: 1000,
      image: null,
      label: 'product',
      amount: 1000,
      active: true,
      userId: '1',
      costPerkg: 1000,
      co2Perkg: 0,
      customerId: '1',
      parentId: null,
      path: null
    });
  });

  it('should create a child to a root registration point', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'parentId': 10000,
          'customerId': 1,
          'name': 'Special registration point',
          'userId': 1,
          'cost': 1000,
          'active': true,
          'image': null
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const { id, ...data } = res.body;
    expectChakram(id).to.not.be.null;
    expectChakram(data).to.deep.equal({
      name: 'Special registration point',
      cost: 1000,
      image: null,
      amount: 1000,
      active: true,
      co2Perkg: 0,
      label: 'product',
      userId: '1',
      costPerkg: 1000,
      customerId: '1',
      parentId: '10000',
      path: '10000'
    });
  });

  it('should create a child to a child registration point', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'parentId': 10057,
          'customerId': 1,
          'name': 'Special registration point',
          'userId': 1,
          'cost': 1000,
          'active': true,
          'image': null,
          "co2Perkg": 0
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const { id, ...data } = res.body;
    expectChakram(id).to.not.be.null;
    expectChakram(data).to.deep.equal({
      name: 'Special registration point',
      cost: 1000,
      image: null,
      amount: 1000,
      active: true,
      userId: '1',
      label: 'product',
      costPerkg: 1000,
      customerId: '1',
      parentId: '10057',
      path: '10002.10014.10057',
      co2Perkg: 0
    });
  });

  it('should not create s child registration point if parent doesnt exist', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'parentId': 99999,
          'customerId': 1,
          'name': 'Special registration point',
          'userId': 1,
          'cost': 1000,
          'active': true,
          'image': null,
          "co2Perkg": 0
        }
      });
    expectChakram(res).to.have.status(400);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
  });

  it('should create a registration point with 0 in cost', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'customerId': 1,
          'name': 'Special registration point',
          'userId': 1,
          'parentId': 10008,
          'cost': 0,
          'active': true,
          'image': null,
          "co2Perkg": 0
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(res.body.cost).to.equal(0);
  });

  it('Should patch a registration point', async () => {
    const res = await chakram.request('PATCH', '/registration-points/10083', {
      'body': [{
        'op': 'replace',
        'path': '/name',
        'value': 'Salmon edited'
      }],
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res.body.id).to.equal('10083');
    expectChakram(res.body.name).to.equal('Salmon edited');
    expectChakram(res.body.parentId).to.equal('10023');
    expectChakram(res.body.path).to.equal('10001.10023');
  });

  it('Should patch a registration point when replacing parentId', async () => {
    const resGet = await chakram.request('GET', '/registration-points/10083', {
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(resGet.body.parentId).to.equal('10023');

    const res = await chakram.request('PATCH', '/registration-points/10083', {
      'body': [{
        'op': 'replace',
        'path': '/parentId',
        'value': '10018'
      }],
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res.body.parentId).to.equal('10018');
    expectChakram(res.body.path).to.equal('10005.10018');
  });

  it('Should patch a registration point when adding a parentId', async () => {
    const resGet = await chakram.request('GET', '/registration-points/10043', {
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const res = await chakram.request('PATCH', '/registration-points/10043', {
      'body': [{
        'op': 'add',
        'path': '/parentId',
        'value': '10018'
      }],
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res.body.parentId).to.equal('10018');
  });

  it('Should patch a registration point parentId when given multiple operations', async () => {
    const resGet = await chakram.request('GET', '/registration-points/10083', {
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(resGet.body.parentId).to.equal('10023');

    const res = await chakram.request('PATCH', '/registration-points/10083', {
      'body': [{
        'op': 'replace',
        'path': '/parentId',
        'value': null
      }, {
        'op': 'add',
        'path': '/parentId',
        'value': '10018'
      }],
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res.body.parentId).to.equal('10018');
  });

  it('Should patch registration point when replacing parentId with null', async () => {
    const resGet = await chakram.request('GET', '/registration-points/10083', {
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(resGet.body.parentId).to.not.be.null;

    const res = await chakram.request('PATCH', '/registration-points/10083', {
      'body': [{
        'op': 'replace',
        'path': '/parentId',
        'value': null
      }],
      'headers': {
        'authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res.body.parentId).to.be.null;
    expectChakram(res.body.path).to.be.null;

  });

  it('should get all registration points if a JWT with customerID as integer is used', async () => {
    const res = await chakram.request('GET', '/registration-points', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(74);
  });

  it('should create a registration point if a JWT with customerID as integer is used', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
        },
        'body': {
          'name': 'Special registration point with longLivedAccessTokenCustomerAsInteger',
          'userId': 1,
          'parentId': 10018,
          'cost': 1000,
          'active': true,
          'image': null,
          "co2Perkg": 0
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
  });

  it('Should be able to deactivate a leaf registration point', async () => {

    const res = await chakram.request('PATCH', '/registration-points/10098', {
      'body': [{
        "op": "replace",
        "path": "/active",
        "value": false
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.active).to.equal(false);
  });

  it('Should be able to deactivate a root registration point', async () => {
    const res = await chakram.request('PATCH', '/registration-points/10095', {
      'body': [{
        "op": "replace",
        "path": "/active",
        "value": false
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.active).to.equal(false);

    const getRes = await chakram.request('GET', '/registration-points?path[$contained]=10007');
    expectChakram(getRes.body.some(point => point.active)).to.equal(false);

  });

  it('Should be able to deactivate a subroot registration point', async () => {
    const res = await chakram.request('PATCH', '/registration-points/10096', {
      'body': [{
        "op": "replace",
        "path": "/active",
        "value": false
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.active).to.equal(false);

    const getRes = await chakram.request('GET', '/registration-points?path[$contained]=10095.10096');
    expectChakram(getRes.body.some(point => point.active)).to.equal(false);
  });


  it('Should not be able to deactivate a registration point associated with an ongoing project when patch value FALSE is a boolean', async () => {
    const res = await chakram.request('PATCH', '/registration-points/10083', {
      'body':
        [{
          "op": "replace",
          "path": "/active",
          "value": false  // it's of type boolean
        }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(409);
    expectChakram(res.body.errorCode).to.equal('E258');
  });

  it('Should not be able to deactivate a registration point associated with an ongoing project when patch value FALSE is a string', async () => {
    const res = await chakram.request('PATCH', '/registration-points/10083', {
      'body':
        [{
          "op": "replace",
          "path": "/active",
          "value": 'false'  // it's of type string
        }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(409);
    expectChakram(res.body.errorCode).to.equal('E258');
  });

  it('Should not be able to delete a registration point associated with an ongoing project', async () => {
    const res = await chakram.request('DELETE', '/registration-points/10083', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(409);
    expectChakram(res.body.errorCode).to.equal('E258');
  });

  it('Should be able to delete a root registration point', async () => {
    const res = await chakram.request('DELETE', '/registration-points/10095', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const descendantRes = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10095');
    expectChakram(descendantRes.body.some(point => !point.deletedAt)).to.equal(false);

  });

  it('Should be able to delete a subroot registration point', async () => {
    const res = await chakram.request('DELETE', '/registration-points/10095', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const descendantRes = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10095.10096');
    expectChakram(descendantRes.body.some(point => !point.deletedAt)).to.equal(false);
  });

  it('Should fail creating a registration point if no customerId is provided in accessToken payload', async () => {
    const res = await chakram.request('POST', '/registration-points', {
      'body': {
        'customerId': 1,
        'name': 'Special registration point 3',
        'userId': 1,
        'parentId': 10018,
        'cost': 1500,
        'active': true,
        'image': null,
        "co2Perkg": 0
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNoCustomer
      }
    });
    expectChakram(res).to.have.status(401);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.errorCode).to.equal('E029');
  });

  it('Should be possible to create a registration point without parentId', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'customerId': 1,
          'name': 'Registration point without parent',
          'userId': 1,
          'cost': 1500,
          'active': true,
          'image': null,
          "co2Perkg": 0
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.parentId).to.be.null;
  });

  it('Should be possible to create a registration point with parentId = null', async () => {
    const res = await chakram.request('POST', '/registration-points',
      {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        'body': {
          'customerId': 1,
          'name': 'Registration point without parent 2',
          'userId': 1,
          'cost': 1500,
          'active': true,
          'image': null,
          'parentId': null,
          "co2Perkg": 0
        }
      });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.parentId).to.equal(null);
  });

  it('Should get all registration points including deleted', async () => {
    const res = await chakram.request('GET', '/registration-points?includeSoftDeleted=true', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(6);
  });

  it('Should get all non-deleted registration points', async () => {
    const res = await chakram.request('GET', '/registration-points', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(3);
  });

  it('Should cascade parent change to children when a root point becomes a child', async () => {
    const { body: rootBeforeUpdate } = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10095', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const { body: updateToRoot } = await chakram.request('PATCH', '/registration-points/10095', {
      'body':
        [{
          "op": "replace",
          "path": "/parentId",
          "value": 10000
        }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const { body: rootAfterUpdate } = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10000.10095', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(updateToRoot.parentId).to.equal('10000');
    expectChakram(updateToRoot.path).to.equal('10000');
    expectChakram(rootBeforeUpdate.length).to.equal(rootAfterUpdate.length);
    expectChakram(rootAfterUpdate.every(child => rootBeforeUpdate.some(point => point.id === child.id))).to.equal(true);
    expectChakram(rootAfterUpdate.every(child => child.path.includes('10000.10095'))).to.equal(true);

  });

  it('Should cascade parent change to children when point with a parent becomes root', async () => {
    const { body: rootBeforeUpdate } = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10095', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const { body: updateToRoot } = await chakram.request('PATCH', '/registration-points/10096', {
      'body':
        [{
          "op": "replace",
          "path": "/parentId",
          "value": null
        }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const { body: rootAfterUpdate } = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10095', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const { body: updatedRootChildren } = await chakram.request('GET', '/registration-points?includeSoftDeleted=true&path[$contained]=10096', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const pointsNotInUpdate = rootBeforeUpdate.filter(point => point.id !== '10096' && !point.path.includes('10096'));
    const pointsInUpdate = rootBeforeUpdate.filter(point => point.path.includes('10096'));
    expectChakram(updateToRoot.parentId).to.equal(null);
    expectChakram(updateToRoot.path).to.equal(null);
    expectChakram(pointsNotInUpdate.length).to.equal(rootAfterUpdate.length);
    expectChakram(updatedRootChildren.every(child => pointsInUpdate.some(point => point.id === child.id))).to.equal(true);

  });

});

describe('registration point trees endpoint', () => {
  it('Should get registration point tree when given id of root node', async () => {
    const res = await chakram.request('GET', '/registration-point-trees/10000', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.id).to.equal('10000');
    expectChakram(res.body.children.length).to.equal(6);
  });

  it('Should get registration point tree when given id is not of root node', async () => {
    const res = await chakram.request('GET', '/registration-point-trees/10078', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.id).to.equal('10000');
    expectChakram(res.body.children.length).to.equal(6);
  });

  it('Should get all registration point trees excluding deleted', async () => {
    const res = await chakram.request('GET', '/registration-point-trees', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(1);
  });

  it('Should get all registration point trees including deleted', async () => {
    const res = await chakram.request('GET', '/registration-point-trees?includeSoftDeleted=true', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(2);
  });
});

