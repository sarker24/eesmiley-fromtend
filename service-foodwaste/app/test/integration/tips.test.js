const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLiveAdminAccessToken = app.get('testLongLivedAdminAccessToken');

describe('tips endpoint', () => {

  it('should get all tips', () => {
    return chakram.request('GET', '/tips', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(3);
    });
  });

  it('should get a tip', () => {
    return chakram.request('GET', '/tips/10002', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.title.EN).to.equal('Consectetur adipiscing elit');
    });
  });

  it('should be able to create a tip', () => {
    return chakram.request('POST', '/tips', {
      'body': {
        "title": {
          "EN": "This is EN title",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": true
      },
      'headers': {
        'Authorization': 'Bearer ' + longLiveAdminAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);

      return chakram.request('GET', '/tips/' + res.body.id).then(function (res) {
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      })
    });
  });

  it('should be able to patch a tip', () => {
    return chakram.request('PATCH', '/tips/10000', {
      'body': [{
        'op': 'replace',
        'path': '/title/EN',
        'value': 'Hello'
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAdminAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      expectChakram(res.body.title.EN).to.equal('Hello');
    });
  });

});
