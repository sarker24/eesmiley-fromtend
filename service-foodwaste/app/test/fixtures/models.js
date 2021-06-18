const DefaultExpectedFoodwastePerGuest = 80;
const DefaultPerGuestBaseline = 110;
const DefaultPerGuestStandard = 60;

function createDefaultPerGuestTargets() {
  return {
    expectedFoodwastePerGuest: [{ from: '1970-01-01', amount: DefaultExpectedFoodwastePerGuest, unit: 'g', period: 'fixed', amountNormalized: DefaultExpectedFoodwastePerGuest }],
    perGuestBaseline: [{ from: '1970-01-01', amount: DefaultPerGuestBaseline, unit: 'g', period: 'fixed', amountNormalized: DefaultPerGuestBaseline }],
    perGuestStandard: [{ from: '1970-01-01', amount: DefaultPerGuestStandard, unit: 'g', period: 'fixed', amountNormalized: DefaultPerGuestStandard }]
  }
}

module.exports = {
  createDefaultPerGuestTargets,
  /*
   * ACTIONS
   */
  action: [
    {
      customerId: 1,
      name: "Taking out the trash",
      description: "Taking the trash and put it in the trashcan",
      userId: 1
    },
    {
      customerId: 1,
      name: "Test",
      description: "Taking the trash and put it in the trashcan",
      userId: 1
    },
    {
      customerId: 1,
      name: "Test",
      description: "Taking the trash and put it in the trashcan",
      userId: 2
    },
    {
      customerId: 2,
      name: "Taking out the trash",
      description: "Taking the trash and put it in the trashcan",
      userId: 1
    },
    {
      customerId: 2,
      name: "Taking out the trash",
      description: "Taking the trash and put it in the trashcan",
      userId: 1
    },
    //id: 10005
    {
      customerId: 1,
      name: "Stop cooking bad food",
      description: "Taking the trash and put it in the trashcan",
      userId: 1
    },
    //id: 10006
    {
      customerId: 1,
      name: "Get a dog",
      description: "Taking the trash and put it in the trashcan",
      userId: 1
    }
  ],

  /*
   * TIPS
   */
  tip: [
    {
      title: {
        EN: "A new title in english",
        DK: "Det er en DK title",
        NO: "Blah blah in Norwegian"
      },
      content: {
        EN: "This is the content in EN",
        DK: "Det er contenten i Dansk",
        NO: "Blah blah in Norwegian"
      },
      imageUrl: "www.sdihfsudhfiusdhiufhsdui.com",
      isActive: false,
      createdAt: '2016-04-12 10:12:34+00'
    },
    {
      title: {
        EN: "Consectetur adipiscing elit 123",
        DK: "Lorem ipsum dolor sit amet",
        NO: "Duis tempor eu est ut finibus"
      },
      content: {
        EN: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.",
        DK: "DK - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.",
        NO: "NO - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex."
      },
      imageUrl: "www.sdihfsudhfiusdhiufhsdui.com",
      isActive: true,
      createdAt: '2016-04-12 10:12:34+00'
    },
    {
      title: {
        EN: "Consectetur adipiscing elit",
        DK: "Lorem ipsum dolor sit amet",
        NO: "Duis tempor eu est ut finibus"
      },
      content: {
        EN: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.",
        DK: "DK - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.",
        NO: "NO - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex."
      },
      imageUrl: "www.sdihfsudhfiusdhiufhsdui.com",
      isActive: true,
      createdAt: '2016-04-12 10:12:34+00'
    }
  ],

  /*
   * SETTINGS
   */
  settings: [
    {
      customerId: 1,
      userId: 1,
      history: {},
      current: {
        name: 'Customer 1',
        areas: [
          "Køkken"
        ],
        currency: 'DKK',
        unit: 'kg',
        categories: [
          {
            name: "Kød",
            products: [
              {
                cost: 7500,
                name: "Svin"
              }
            ]
          }
        ],
        accounts: [
          { id: 10240, name: "(1339) KLP Ørestad 5H " },
          { id: 10244, name: "(1122) Dong Asnæsværket" },
          { id: 10479, name: "(1190) Novo Nordisk EG" },
          { id: 10507, name: "(1191) Novo Nordisk DF" },
          { id: 10525, name: "(1194) Novo Nordisk HC" },
          { id: 10544, name: "(1189) Novo Nordisk AE" },
          { id: 1, name: "eSmiley" },
          { id: 2, name: "Fields" },
          { id: 3, name: "Kebabistan" },
          { id: 4, name: "Some company" },
          { id: 5, name: "Some other company" }
        ],
        expectedWeeklyWaste: {
          '0': 100000,
          '2018-08-01': 200000
        },
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedFoodwaste: [
          { from: '1970-01-01', amount: 100000, period: 'week', unit: 'g', amountNormalized: 100000 / 7 },
          { from: '2018-08-01', amount: 200000, period: 'week', unit: 'g', amountNormalized: 200000 / 7 }
        ],
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3] }],
        ...createDefaultPerGuestTargets()
      }
    },
    {
      customerId: 2,
      userId: 1,
      current: {
        name: 'Customer 2',
        currency: 'DKK',
        unit: 'kg',
        accounts: [
          { id: 1, name: "eSmiley" },
          { id: 2, name: "Fields" },
          { id: 3, name: "Kebabistan" }
        ],
        // missing 'registrationsFrequency'
        expectedWeeklyWaste: {
          '0': 100000,
          '2018-08-01': 200000
        },
        expectedFoodwaste: [{
          from: '1970-01-01',
          amount: 100000,
          unit: 'g',
          period: 'week',
          amountNormalized: 100000 / 7,
        }, {
          from: '2018-08-01',
          amount: 200000,
          unit: 'g',
          period: 'week',
          amountNormalized: 200000 / 7
        }],
        ...createDefaultPerGuestTargets()
      },
      history: {}
    },
    {
      customerId: 3,
      userId: 113,
      current: {},
      history: {}
    },
    {
      customerId: 4,
      userId: 4,
      current: {
        name: 'Customer 4',
        currency: 'DKK',
        unit: 'kg',
        registrationsFrequency: { '0': [1, 2, 3, 4, 5] },
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3, 4, 5] }]
        // missing 'expectedWeeklyWaste'
      },
      history: {}
    },
    {
      customerId: 5,
      userId: 5,
      current: {
        name: 'Customer 5',
        currency: 'DKK',
        unit: 'kg',
        registrationsFrequency: { '0': [6, 0] },
        expectedFrequency: [{ from: '1970-01-01', days: [6, 0] }]
        // missing 'expectedWeeklyWaste'
      },
      history: {}
    },
    {
      customerId: 11,
      userId: 11,
      history: {},
      current: {}
    },
    {
      customerId: 10240,
      userId: 10240,
      history: {},
      current: {
        name: '(1339) KLP Ørestad 5H ',
        currency: 'DKK',
        unit: 'kg',
        accounts: [{ id: 123, name: 'asdf' }, { id: 321, name: 'fdsa' }],
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedWeeklyWaste: { '2018-08-27': 123000, '2018-08-20': 321000 },
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3] }],
        expectedFoodwaste: [
          { from: '2018-08-27', amount: 123000, unit: 'g', period: 'week', amountNormalized: 123000 / 7 },
          { from: '2018-08-20', amount: 321000, unit: 'g', period: 'week', amountNormalized: 321000 / 7 }
        ],
        ...createDefaultPerGuestTargets()
      }
    },
    {
      customerId: 51,
      userId: 232,
      current: {
        name: 'Customer 51',
        currency: 'DKK',
        unit: 'kg',
        accounts: [
          { id: 1, name: "eSmiley" },
          { id: 2, name: "Fields" },
          { id: 3, name: "Kebabistan" }
        ],
        expectedWeeklyWaste: {
          '0': 100000,
          '2018-08-01': 200000
        },
        registrationsFrequency: { '0': [1, 2, 3, 4, 5, 6] },
        expectedFoodwaste: [
          { from: '1970-01-01', amount: 100000, unit: 'g', period: 'week', amountNormalized: 100000/7 },
          { from: '2018-08-01', amount: 200000, unit: 'g', period: 'week', amountNormalized: 200000/7 },
        ],
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3, 4, 5, 6] }],
        ...createDefaultPerGuestTargets()
      },
      history: {}
    },
    {
      customerId: 10244,
      userId: 10244,
      history: {},
      current: {
        name: '(1122) Dong Asnæsværket',
        currency: 'DKK',
        unit: 'kg',
        accounts: [{ id: 123, name: 'asdf' }, { id: 321, name: 'fdsa' }],
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedWeeklyWaste: {}, // is empty
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3] }],
        expectedFoodwaste: [] // is empty
      }
    },
    {
      customerId: 10479,
      userId: 10479,
      history: {},
      current: {
        name: '(1190) Novo Nordisk EG',
        currency: 'DKK',
        unit: 'kg',
        accounts: [{ id: 123, name: 'asdf' }, { id: 321, name: 'fdsa' }],
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedWeeklyWaste: { '2018-08-27': 123000, '2018-08-20': 321000 },
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3] }],
        expectedFoodwaste: [
          { from: '2018-08-27', amount: 123000, unit: 'g', period: 'week', amountNormalized: 123000 / 7 },
          { from: '2018-08-20', amount: 321000, unit: 'g', period: 'week', amountNormalized: 321000 / 7 },
        ],
        ...createDefaultPerGuestTargets()
      }
    },
    {
      customerId: 10507,
      userId: 10507,
      history: {},
      current: {
        name: '(1191) Novo Nordisk DF',
        currency: 'DKK',
        unit: 'kg',
        accounts: [{ id: 123, name: 'asdf' }, { id: 321, name: 'fdsa' }],
        registrationsFrequency: {}, // is empty
        expectedWeeklyWaste: { '2018-08-27': 123000, '2018-08-20': 321000 },
        expectedFrequency: [],
        expectedFoodwaste: [
          { from: '2018-08-27', amount: 123000, unit: 'g', period: 'week', amountNormalized: 123000 / 7 },
          { from: '2018-08-20', amount: 321000, unit: 'g', period: 'week', amountNormalized: 321000 / 7 },
        ],
        ...createDefaultPerGuestTargets()
      }
    },
    {
      customerId: 10525,
      userId: 10525,
      history: {},
      current: {
        name: '(1194) Novo Nordisk HC',
        currency: 'DKK',
        unit: 'kg',
        accounts: [{ id: 123, name: 'asdf' }, { id: 321, name: 'fdsa' }],
        // missing 'registrationsFrequency'
        expectedWeeklyWaste: { '2018-08-27': 123000, '2018-08-20': 321000 },
        expectedFoodwaste: [
          { from: '2018-08-27', amount: 123000, unit: 'g', period: 'week', amountNormalized: 123000 / 7 },
          { from: '2018-08-20', amount: 321000, unit: 'g', period: 'week', amountNormalized: 321000 / 7 },
        ],
        ...createDefaultPerGuestTargets()
      }
    },
    {
      customerId: 10544,
      userId: 10544,
      history: {},
      current: {
        name: '(1189) Novo Nordisk AE',
        currency: 'DKK',
        unit: 'kg',
        accounts: [{ id: 123, name: 'asdf' }, { id: 321, name: 'fdsa' }],
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedFrequency: [{ from: '1970-01-01', days: [1, 2, 3] }]
        // missing 'expectedWeeklyWaste'
      }
    },
    {
      customerId: 6767,
      userId: 232,
      current: {
        name: 'Customer 2',
        currency: 'DKK',
        unit: 'kg',
        accounts: [
          { id: 1, name: "eSmiley" },
          { id: 2, name: "Fields" },
          { id: 3, name: "Kebabistan" }
        ],
        // missing 'registrationsFrequency'
        expectedWeeklyWaste: {
          '0': 100000,
          '2018-08-01': 200000
        },
        expectedFoodwaste: [
          { from: '1970-01-01', amount: 100000, unit: 'g', period: 'week', amountNormalized: 100000 / 7 },
          { from: '2018-08-01', amount: 200000, unit: 'g', period: 'week', amountNormalized: 200000 / 7 },
        ],
        ...createDefaultPerGuestTargets()
      },
      history: {}
    },
  ],

  /*
   * AREAS
   */
  area: [
    {//id: 10000,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 1,
      name: 'Test',
      active: true,
      oldModelId: 10001,
      label: 'area'
    },
    {//id: 10001,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 1,
      name: 'Kitchen',
      active: true,
      oldModelId: 10000,
      label: 'area'
    },
    {//id: 10002,
      parentId: null,
      path: null,
      userId: 2,
      customerId: 1,
      name: 'Office',
      active: true,
      bootstrapKey: 'bootsrap.key.areas',
      oldModelId: 10002,
      label: 'area'
    },
    {//id: 10003,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 2,
      name: 'Kitchen',
      active: true,
      bootstrapKey: 'bootsrap.key.areas',
      oldModelId: 10003,
      label: 'area'
    },
    {//id: 10004,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 1,
      name: 'Second Kitchen',
      active: true,
      bootstrapKey: 'bootsrap.key.areas',
      oldModelId: 10004,
      label: 'area'
    },
    {//id: 10005,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 1,
      name: 'Third Kitchen',
      active: true,
      bootstrapKey: 'bootsrap.key.areas.thidkitchen',
      oldModelId: 10006,
      label: 'area'
    },
    {//id: 10006,
      parentId: null,
      path: null,
      userId: 6767,
      customerId: 6767,
      name: 'Some inactive Area',
      active: false,
      oldModelId: 10007,
      label: 'area'
    },
    {//id: 10007,
      parentId: null,
      path: null,
      userId: 2,
      customerId: 2,
      name: 'Basement Kitchen',
      active: true,
      oldModelId: 10008,
      label: 'area'
    },
  ],

  /*
   * PRODUCT CATEGORIES
   */
  category: [
    {//id: 10008,
      parentId: 10000,
      path: '10000',
      userId: 1,
      customerId: 1,
      name: 'Cake',
      active: true,
      oldModelId: 10000,
      label: 'category'
    },
    {//id: 10009,
      parentId: 10000,
      path: '10000',
      userId: 1,
      customerId: 1,
      name: 'Candy',
      active: true,
      oldModelId: 10005,
      label: 'category'
    },
    {//id: 10010,
      parentId: 10000,
      path: '10000',
      userId: 1,
      customerId: 1,
      name: 'Fish',
      active: true,
      oldModelId: 10001,
      label: 'category'
    },
    {//id: 10011,
      parentId: 10002,
      path: '10002',
      userId: 1,
      customerId: 1,
      name: 'Cake',
      active: true,
      oldModelId: 10000,
      label: 'category'
    },
    {//id: 10012,
      parentId: 10002,
      path: '10002',
      userId: 1,
      customerId: 1,
      name: 'Fish',
      active: true,
      oldModelId: 10001,
      label: 'category'
    },
    {//id: 10013,
      parentId: 10000,
      path: '10000',
      userId: 1,
      customerId: 1,
      name: 'Test',
      active: true,
      oldModelId: 10002,
      label: 'category'
    },
    {//id: 10014,
      parentId: 10002,
      path: '10002',
      userId: 1,
      customerId: 1,
      name: 'Test',
      active: true,
      oldModelId: 10002,
      label: 'category'
    },
    {//id: 10015,
      parentId: 10002,
      path: '10002',
      userId: 1,
      customerId: 1,
      name: 'Candy',
      active: true,
      oldModelId: 10005,
      label: 'category'
    },
    {//id: 10016,
      parentId: 10002,
      path: '10002',
      userId: 1,
      customerId: 1,
      name: 'Category with inactive Products',
      active: true,
      oldModelId: 10008,
      label: 'category'
    },
    {//id: 10017,
      parentId: 10005,
      path: '10005',
      userId: 1,
      customerId: 1,
      name: 'Cake',
      active: true,
      oldModelId: 10000,
      label: 'category'
    },
    {//id: 10018,
      parentId: 10005,
      path: '10005',
      userId: 1,
      customerId: 1,
      name: 'Fish',
      active: true,
      oldModelId: 10001,
      label: 'category'
    },
    {//id: 10019,
      parentId: 10005,
      path: '10005',
      userId: 1,
      customerId: 1,
      name: 'Test',
      active: true,
      oldModelId: 10002,
      label: 'category'
    },
    {//id: 10020,
      parentId: 10005,
      path: '10005',
      userId: 1,
      customerId: 1,
      name: 'Candy',
      active: true,
      oldModelId: 10005,
      label: 'category'
    },
    {//id: 10021,
      parentId: 10000,
      path: '10000',
      userId: 1,
      customerId: 1,
      name: 'Category with inactive Products',
      active: true,
      oldModelId: 10008,
      label: 'category'
    },
    {//id: 10022,
      parentId: 10005,
      path: '10005',
      userId: 1,
      customerId: 1,
      name: 'Category with inactive Products',
      active: true,
      oldModelId: 10008,
      label: 'category'
    },
    {//id: 10023,
      parentId: 10001,
      path: '10001',
      userId: 1,
      customerId: 1,
      name: 'Cake',
      active: true,
      oldModelId: 10000,
      label: 'category'
    },
    {//id: 10024,
      parentId: 10001,
      path: '10001',
      userId: 1,
      customerId: 1,
      name: 'Fish',
      active: true,
      oldModelId: 10001,
      label: 'category'
    },
    {//id: 10025,
      parentId: 10001,
      path: '10001',
      userId: 1,
      customerId: 1,
      name: 'Test',
      active: true,
      oldModelId: 10002,
      label: 'category'
    },
    {//id: 10026,
      parentId: 10001,
      path: '10001',
      userId: 1,
      customerId: 1,
      name: 'Candy',
      active: true,
      oldModelId: 10005,
      label: 'category'
    },
    {//id: 10027,
      parentId: 10001,
      path: '10001',
      userId: 1,
      customerId: 1,
      name: 'Category with inactive Products',
      active: true,
      oldModelId: 10008,
      label: 'category'
    },
    {//id: 10028,
      parentId: 10004,
      path: '10004',
      userId: 1,
      customerId: 1,
      name: 'Cake',
      active: true,
      oldModelId: 10000,
      label: 'category'
    },
    {//id: 10029,
      parentId: 10004,
      path: '10004',
      userId: 1,
      customerId: 1,
      name: 'Fish',
      active: true,
      oldModelId: 10001,
      label: 'category'
    },
    {//id: 10030,
      parentId: 10004,
      path: '10004',
      userId: 1,
      customerId: 1,
      name: 'Test',
      active: true,
      oldModelId: 10002,
      label: 'category'
    },
    {//id: 10031,
      parentId: 10004,
      path: '10004',
      userId: 1,
      customerId: 1,
      name: 'Candy',
      active: true,
      oldModelId: 10005,
      label: 'category'
    },
    {//id: 10032,
      parentId: 10004,
      path: '10004',
      userId: 1,
      customerId: 1,
      name: 'Category with inactive Products',
      active: true,
      oldModelId: 10008,
      label: 'category'
    },
    {//id: 10033,
      parentId: 10003,
      path: '10003',
      userId: 1,
      customerId: 2,
      name: 'Vegetables',
      active: true,
      bootstrapKey: 'bootsrap.key.catagories',
      oldModelId: 10004,
      label: 'category'
    },
    {//id: 10034,
      parentId: 10003,
      path: '10003',
      userId: 1,
      customerId: 2,
      name: 'Meat',
      active: true,
      oldModelId: 10003,
      label: 'category'
    },
    {//id: 10035,
      parentId: 10007,
      path: '10007',
      userId: 1,
      customerId: 2,
      name: 'Meat',
      active: true,
      oldModelId: 10003,
      label: 'category'
    },
    {//id: 10036,
      parentId: 10007,
      path: '10007',
      userId: 1,
      customerId: 2,
      name: 'Vegetables',
      active: true,
      bootstrapKey: 'bootsrap.key.catagories',
      oldModelId: 10004,
      label: 'category'
    },
    {//id: 10037,
      parentId: 10006,
      path: '10006',
      userId: 6767,
      customerId: 6767,
      name: 'Some other Category with inactive Products',
      active: true,
      oldModelId: 10009,
      label: 'category'
    },
    {//id: 10038,
      parentId: 10006,
      path: '10006',
      userId: 6767,
      customerId: 6767,
      name: 'Some other Category',
      active: true,
      oldModelId: 10010,
      label: 'category'
    },
  ],

  /*
   * PRODUCTS
   */
  product: [
    {//id: 10039,
      parentId: 10000,
      path: '10000',
      userId: 1,
      customerId: 1,
      name: 'Pineapple Uncategorized',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10007,
      label: 'product'
    },
    {//id: 10040,
      parentId: 10002,
      path: '10002',
      userId: 1,
      customerId: 1,
      name: 'Pineapple Uncategorized',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10007,
      label: 'product'
    },
    {//id: 10041,
      parentId: 10005,
      path: '10005',
      userId: 1,
      customerId: 1,
      name: 'Pineapple Uncategorized',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10007,
      label: 'product'
    },
    {//id: 10042,
      parentId: 10004,
      path: '10004',
      userId: 1,
      customerId: 1,
      name: 'Pineapple Uncategorized',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10007,
      label: 'product'
    },
    {//id: 10043,
      parentId: 10001,
      path: '10001',
      userId: 1,
      customerId: 1,
      name: 'Pineapple Uncategorized',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10007,
      label: 'product'
    },
    {//id: 10044,
      parentId: 10003,
      path: '10003',
      userId: 2,
      customerId: 2,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10012,
      label: 'product'
    },
    {//id: 10045,
      parentId: 10003,
      path: '10003',
      userId: 2,
      customerId: 2,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10013,
      label: 'product'
    },
    {//id: 10046,
      parentId: 10003,
      path: '10003',
      userId: 2,
      customerId: 2,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10014,
      label: 'product'
    },
    {//id: 10047,
      parentId: 10003,
      path: '10003',
      userId: 2,
      customerId: 2,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10015,
      label: 'product'
    },
    {//id: 10048,
      parentId: 10007,
      path: '10007',
      userId: 2,
      customerId: 2,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10012,
      label: 'product'
    },
    {//id: 10049,
      parentId: 10007,
      path: '10007',
      userId: 2,
      customerId: 2,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10013,
      label: 'product'
    },
    {//id: 10050,
      parentId: 10007,
      path: '10007',
      userId: 2,
      customerId: 2,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10014,
      label: 'product'
    },
    {//id: 10051,
      parentId: 10007,
      path: '10007',
      userId: 2,
      customerId: 2,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10015,
      label: 'product'
    },
    {//id: 10052,
      parentId: 10037,
      path: '10006.10037',
      userId: 1,
      customerId: 6767,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      oldModelId: 10009,
      label: 'product',
      categoryId: 10037
    },
    {//id: 10053,
      parentId: 10037,
      path: '10006.10037',
      userId: 1,
      customerId: 6767,
      name: 'Hit that beef',
      cost: 1000,
      active: false,
      amount: 2000,
      costPerkg: 500,
      oldModelId: 10010,
      label: 'product',
      categoryId: 10037
    },
    {//id: 10054,
      parentId: 10037,
      path: '10006.10037',
      userId: 1,
      customerId: 6767,
      name: 'Hit that pork damn it',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      oldModelId: 10011,
      label: 'product',
      categoryId: 10037
    },
    {//id: 10055,
      parentId: 10010,
      path: '10000.10010',
      userId: 1,
      customerId: 1,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10001,
      label: 'product',
      categoryId: 10010
    },
    {//id: 10056,
      parentId: 10014,
      path: '10002.10014',
      userId: 1,
      customerId: 1,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10002,
      label: 'product',
      categoryId: 10014
    },
    {//id: 10057,
      parentId: 10014,
      path: '10002.10014',
      userId: 1,
      customerId: 1,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10003,
      label: 'product',
      categoryId: 10014
    },
    {//id: 10058,
      parentId: 10014,
      path: '10002.10014',
      userId: 1,
      customerId: 1,
      name: 'Pineapple',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10004,
      label: 'product',
      categoryId: 10014
    },
    {//id: 10059,
      parentId: 10017,
      path: '10005.10017',
      userId: 1,
      customerId: 1,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 5000,
      oldModelId: 10000,
      label: 'product',
      categoryId: 10017
    },
    {//id: 10060,
      parentId: 10022,
      path: '10005.10022',
      userId: 1,
      customerId: 1,
      name: 'Inactive product',
      cost: 1000,
      active: false,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10008,
      label: 'product',
      categoryId: 10022
    },
    {//id: 10061,
      parentId: 10012,
      path: '10002.10012',
      userId: 1,
      customerId: 1,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10001,
      label: 'product',
      categoryId: 10012
    },
    {//id: 10062,
      parentId: 10032,
      path: '10004.10032',
      userId: 1,
      customerId: 1,
      name: 'Inactive product',
      cost: 1000,
      active: false,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10008,
      label: 'product',
      categoryId: 10032
    },
    {//id: 10063,
      parentId: 10016,
      path: '10002.10016',
      userId: 1,
      customerId: 1,
      name: 'Inactive product',
      cost: 1000,
      active: false,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10008,
      label: 'product',
      categoryId: 10016
    },
    {//id: 10064,
      parentId: 10025,
      path: '10001.10025',
      userId: 1,
      customerId: 1,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10002,
      label: 'product',
      categoryId: 10025
    },
    {//id: 10065,
      parentId: 10025,
      path: '10001.10025',
      userId: 1,
      customerId: 1,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10003,
      label: 'product',
      categoryId: 10025
    },
    {//id: 10066,
      parentId: 10025,
      path: '10001.10025',
      userId: 1,
      customerId: 1,
      name: 'Pineapple',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10004,
      label: 'product',
      categoryId: 10025
    },
    {//id: 10067,
      parentId: 10029,
      path: '10004.10029',
      userId: 1,
      customerId: 1,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10001,
      label: 'product',
      categoryId: 10029
    },
    {//id: 10068,
      parentId: 10013,
      path: '10000.10013',
      userId: 1,
      customerId: 1,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10002,
      label: 'product',
      categoryId: 10013
    },
    {//id: 10069,
      parentId: 10013,
      path: '10000.10013',
      userId: 1,
      customerId: 1,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10003,
      label: 'product',
      categoryId: 10013
    },
    {//id: 10070,
      parentId: 10013,
      path: '10000.10013',
      userId: 1,
      customerId: 1,
      name: 'Pineapple',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10004,
      label: 'product',
      categoryId: 10013
    },
    {//id: 10071,
      parentId: 10019,
      path: '10005.10019',
      userId: 1,
      customerId: 1,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10002,
      label: 'product',
      categoryId: 10019
    },
    {//id: 10072,
      parentId: 10019,
      path: '10005.10019',
      userId: 1,
      customerId: 1,
      name: 'Pineapple',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10004,
      label: 'product',
      categoryId: 10019
    },
    {//id: 10073,
      parentId: 10019,
      path: '10005.10019',
      userId: 1,
      customerId: 1,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10003,
      label: 'product',
      categoryId: 10019
    },
    {//id: 10074,
      parentId: 10024,
      path: '10001.10024',
      userId: 1,
      customerId: 1,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10001,
      label: 'product',
      categoryId: 10024
    },
    {//id: 10075,
      parentId: 10030,
      path: '10004.10030',
      userId: 1,
      customerId: 1,
      name: 'Test',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10002,
      label: 'product',
      categoryId: 10030
    },
    {//id: 10076,
      parentId: 10030,
      path: '10004.10030',
      userId: 1,
      customerId: 1,
      name: 'Beef',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: '_bootstraps.product.beef',
      oldModelId: 10003,
      label: 'product',
      categoryId: 10030
    },
    {//id: 10077,
      parentId: 10030,
      path: '10004.10030',
      userId: 1,
      customerId: 1,
      name: 'Pineapple',
      cost: 1000,
      active: true,
      amount: 2000,
      costPerkg: 500,
      bootstrapKey: 'bootsrap.key.products',
      oldModelId: 10004,
      label: 'product',
      categoryId: 10030
    },
    {//id: 10078,
      parentId: 10021,
      path: '10000.10021',
      userId: 1,
      customerId: 1,
      name: 'Inactive product',
      cost: 1000,
      active: false,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10008,
      label: 'product',
      categoryId: 10021
    },
    {//id: 10079,
      parentId: 10018,
      path: '10004.10018',
      userId: 1,
      customerId: 1,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 5000,
      oldModelId: 10000,
      label: 'product',
      categoryId: 10018
    },
    {//id: 10080,
      parentId: 10008,
      path: '10000.10008',
      userId: 1,
      customerId: 1,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 5000,
      oldModelId: 10000,
      label: 'product',
      categoryId: 10008
    },
    {//id: 10081,
      parentId: 10011,
      path: '10002.10011',
      userId: 1,
      customerId: 1,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 5000,
      oldModelId: 10000,
      label: 'product',
      categoryId: 10011
    },
    {//id: 10082,
      parentId: 10018,
      path: '10005.10018',
      userId: 1,
      customerId: 1,
      name: 'Chicken',
      cost: 1000,
      active: true,
      amount: 1000,
      costPerkg: 1000,
      bootstrapKey: '_bootstraps.product.chichen',
      oldModelId: 10001,
      label: 'product',
      categoryId: 10018
    },
    {//id: 10083,
      parentId: 10023,
      path: '10001.10023',
      userId: 1,
      customerId: 1,
      name: 'Salmon',
      cost: 5000,
      active: true,
      amount: 1000,
      costPerkg: 5000,
      oldModelId: 10000,
      label: 'product',
      categoryId: 10023
    },
    {//id: 10084,
      parentId: 10027,
      path: '10001.10027',
      userId: 1,
      customerId: 1,
      name: 'Inactive product',
      cost: 1000,
      active: false,
      amount: 1000,
      costPerkg: 1000,
      oldModelId: 10008,
      label: 'product',
      categoryId: 10027
    },
    {//id: 10085,
      customerId: 10240,
      name: "Chicken",
      parentId: 10010,
      path: '10000.10010',
      userId: 10240,
      label: 'product',
      categoryId: 10010,
      cost: 1230,
      amount: 1000,
      costPerkg: 1230
    },
    {//id: 10086,
      customerId: 10240,
      name: "Pork",
      parentId: 10013,
      path: '10000.10013',
      userId: 10240,
      label: 'product',
      categoryId: 10013,
      cost: 3210,
      amount: 1000,
      costPerkg: 3210
    },
    {//id: 10087,
      customerId: 10479,
      name: "Chicken",
      parentId: 10010,
      path: '10000.10010',
      userId: 10479,
      label: 'product',
      categoryId: 10010,
      cost: 1230,
      amount: 1000,
      costPerkg: 1230
    },
    {//id: 10088,
      customerId: 10479,
      name: "Pork",
      parentId: 10013,
      path: '10000.10013',
      userId: 10479,
      label: 'product',
      categoryId: 10013,
      cost: 3210,
      amount: 1000,
      costPerkg: 3210
    },
    {//id: 10089,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 11,
      name: 'Test Soft Deleted Area',
      active: true,
      deletedAt: '2017-12-04 10:55:33+00',
      oldModelId: 10048,
      label: 'area'
    },
    {//id: 10090,
      parentId: 10089,
      path: null,
      userId: 1,
      customerId: 11,
      name: 'Test Soft Deleted Category',
      active: true,
      deletedAt: '2017-12-04 10:55:33+00',
      oldModelId: 10049,
      label: 'category'
    },
    {//id: 10091,
      userId: 1,
      customerId: 11,
      name: 'Everyday Normal Area',
      active: true,
      label: 'area'
    },
    {//id: 10092,
      parentId: 10091,
      path: '10091',
      userId: 1,
      customerId: 11,
      name: 'Everyday Normal Category',
      active: true,
      label: 'category'
    },
    {//id: 10093,
      parentId: 10091,
      path: '10091.10092',
      userId: 1,
      customerId: 11,
      name: 'Everyday Normal Product',
      active: true,
      label: 'product'
    },
    {//id: 10094,
      parentId: 10091,
      path: '10091.10092',
      userId: 1,
      customerId: 11,
      name: 'Everyday Normal Product Deleted',
      active: true,
      deletedAt: '2017-12-04 10:55:33+00',
      label: 'product'
    },
    {//id: 10095,
      userId: 1,
      customerId: 1,
      name: 'Root not in project',
      active: true,
      label: 'product'
    },
    {//id: 10096,
      parentId: 10095,
      path: '10095',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 1 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10097,
      parentId: 10096,
      path: '10095.10096',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 1 Leaf 1 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10098,
      parentId: 10096,
      path: '10095.10096',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 1 Leaf 2 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10099,
      parentId: 10095,
      path: '10095',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 2 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10100,
      parentId: 10099,
      path: '10099',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 2 Leaf 1 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10101,
      parentId: 10097,
      path: '10095.10096.10097',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 1 Leaf 1 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10102,
      parentId: 10098,
      path: '10095.10096.10098',
      userId: 1,
      customerId: 1,
      name: 'SubRoot 1 Leaf 2 not in project',
      active: true,
      label: 'product'
    },
    {//id: 10103,
      parentId: null,
      path: null,
      userId: 1,
      customerId: 1,
      name: 'Category root not in project',
      active: true,
      label: 'category'
    },
  ],

  /*
   * PROJECT REGISTRATIONS
   */
  project_registration: [
    {
      project_id: '10001',
      registration_id: '10001',
      amount: "1"
    },
    {
      project_id: '10001',
      registration_id: '10002',
      amount: "1"
    },
    {
      project_id: '10001',
      registration_id: '10003',
      amount: "1"
    },
    {
      project_id: '10003',
      registration_id: '10004',
      amount: "1"
    },
    {
      project_id: '10002',
      registration_id: '10005',
      amount: "1"
    },
    {
      project_id: '10000',
      registration_id: '10006',
      amount: "1"
    },
    {
      project_id: '10004',
      registration_id: '10009',
      amount: "1"
    },
    {
      project_id: '10005',
      registration_id: '10010',
      amount: "1"
    },
    {
      project_id: '10006',
      registration_id: '10011',
      amount: "1"
    },
    {
      project_id: '10007',
      registration_id: '10012',
      amount: "1"
    },
    {
      project_id: '10004',
      registration_id: '10013',
      amount: "1"
    },
    {
      project_id: '10005',
      registration_id: '10014',
      amount: "1"
    },
    {
      project_id: '10008',
      registration_id: '10018'
    },
    {
      project_id: '10008',
      registration_id: '10019'
    },
    {
      project_id: '10008',
      registration_id: '10020'
    },
    {
      project_id: '10008',
      registration_id: '10021'
    },
    {
      project_id: '10009',
      registration_id: '10022'
    },
    {
      project_id: '10009',
      registration_id: '10023'
    },
    {
      project_id: '10009',
      registration_id: '10024'
    },
    {
      project_id: '10020',
      registration_id: '10044'
    },
    {
      project_id: '10021',
      registration_id: '10045'
    },
    {
      project_id: '10021',
      registration_id: '10046'
    },
    {
      project_id: '10022',
      registration_id: '10047'
    },
    {
      project_id: '10022',
      registration_id: '10048'
    },
    {
      project_id: '10023',
      registration_id: '10049'
    },
    {
      project_id: '10024',
      registration_id: '10050'
    },
    {
      project_id: '10025',
      registration_id: '10051'
    },
    {
      project_id: '10026',
      registration_id: '10052'
    },
    {
      project_id: '10027',
      registration_id: '10053'
    },
    {
      project_id: '10027',
      registration_id: '10054'
    },
    {
      project_id: '10036',
      registration_id: '10066'
    },
    {
      project_id: '10036',
      registration_id: '10067'
    },
    {
      project_id: '10037',
      registration_id: '10068'
    },
    {
      project_id: '10037',
      registration_id: '10072'
    },
    {
      project_id: '10037',
      registration_id: '10073'
    },
    {
      project_id: '10037',
      registration_id: '10074'
    }
  ],

  /*
   * PROJECTS
   */
  project: [
    {
      parentProjectId: null,
      name: "Parent project",
      duration: {
        days: 10,
        type: "REGISTRATIONS"
      },
      status: "PENDING_FOLLOWUP",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 1,
      customerId: 1,
      active: true
    },
    {
      parentProjectId: 10000,
      name: "Project 2",
      duration: {
        days: 6,
        type: "REGISTRATIONS"
      },
      status: "FINISHED",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 1,
      customerId: 1,
      active: true
    },
    {
      parentProjectId: 10000,
      name: "Project 3",
      duration: {
        days: 6,
        type: "REGISTRATIONS"
      },
      status: "FINISHED",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 1,
      customerId: 1,
      active: true
    },
    {
      parentProjectId: 10000,
      name: "Project 4",
      duration: {
        days: 6,
        type: "REGISTRATIONS"
      },
      status: "PENDING_START",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 1,
      customerId: 1,
      active: true
    },

    {
      parentProjectId: null,
      name: "Parent project",
      duration: {
        days: 10,
        type: "REGISTRATIONS"
      },
      status: "FINISHED",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 2,
      customerId: 2,
      active: true
    },
    {
      parentProjectId: 10004,
      name: "Project 2",
      duration: {
        days: 6,
        type: "REGISTRATIONS"
      },
      status: "PENDING_START",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 2,
      customerId: 2,
      active: true
    },
    {
      parentProjectId: 10004,
      name: "Project 3",
      duration: {
        days: 6,
        type: "REGISTRATIONS"
      },
      status: "PENDING_START",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 2,
      customerId: 2,
      active: true
    },
    {
      parentProjectId: 10004,
      name: "Project 4",
      duration: {
        days: 6,
        type: "REGISTRATIONS"
      },
      status: "PENDING_START",
      registrationPoints: [
        {
          id: 10044,
          name: "Salmon",
          goal: 20
        },
        {
          id: 10045,
          name: "Chicken",
          goal: 30
        }
      ],
      actions: [
        {
          id: 1,
          name: "Use smaller plates"
        },
        {
          id: 2,
          name: "Use napkins with drawings"
        }
      ],
      userId: 2,
      customerId: 2,
      active: true
    },
    {
      name: "Proyecto 1 parent",
      userId: 11,
      customerId: 11,
      duration: {
        days: 10,
        type: "REGISTRATIONS"
      },
      status: "PENDING_START",
      registrationPoints: [
        {
          id: 10055,
          name: "Chicken",
        }
      ],
      actions: []
    },
    {
      parentProjectId: 10008,
      name: "Proyecto 1 child",
      userId: 11,
      customerId: 11,
      duration: {
        days: 10,
        type: "REGISTRATIONS"
      },
      status: "PENDING_START",
      registrationPoints: [
        {
          id: 10055,
          name: "Chicken",
        }
      ],
      actions: []

    },
    {
      // id: 10010,
      parentProjectId: null,
      name: "Proyecto whatever",
      userId: 1,
      customerId: 1,
      duration: {
        days: 3,
        type: "REGISTRATIONS",
        start: 1489104000
      },
      status: "PENDING_START",
      active: true,
      registrationPoints: [
        {
          "id": 10058,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10072,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10077,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10070,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10066,
          "name": "Pineapple",
          "oldModelId": 10004
        }
      ],
      actions: []
    },
    {
      parentProjectId: 10010,
      name: "Proyecto whatever followup",
      userId: 1,
      customerId: 1,
      duration: {
        days: 2,
        type: "REGISTRATIONS"
      },
      status: "PENDING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10058,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10072,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10077,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10070,
          "name": "Pineapple",
          "oldModelId": 10004
        }, {
          "id": 10066,
          "name": "Pineapple",
          "oldModelId": 10004
        }
      ],
      actions: []

    },
    {
      parentProjectId: null,
      name: "Proyecto whatever CALENDAR",
      userId: 1,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1900000000
      },
      status: "PENDING_START",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: 10012,
      name: "Proyecto whatever followup CALENDAR",
      userId: 1,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1490000010,
        end: 1900000000
      },
      status: "PENDING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: null,
      name: "Proyecto  PENDING_INPUT whatever CALENDAR",
      userId: 1,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "PENDING_INPUT",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: null,
      name: "Proyecto  ON_HOLD whatever CALENDAR",
      userId: 1,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "ON_HOLD",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: null,
      name: "Proyecto  PARENT RUNNING_FOLLOWUP whatever CALENDAR",
      userId: 1,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "RUNNING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: 10016,
      name: "Proyecto  CHILDREN1 PENDING_FOLLOWUP whatever CALENDAR",
      userId: 1,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "PENDING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: null,
      name: "Some parent project without followups",
      userId: 1,
      customerId: 2,
      duration: {
        type: "REGISTRATIONS",
        days: 6
      },
      status: "PENDING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: [{ "id": 1, "name": "Use smaller plates" }, { "id": 2, "name": "Use napkins with drawings" }]

    },
    {
      parentProjectId: null,
      name: "Some project 2",
      userId: 1,
      customerId: 3,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "RUNNING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: []

    },
    {
      parentProjectId: null, // id: 10020
      name: "Finished parent project 1",
      userId: 4,
      customerId: 4,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: 10020,
      name: "Finished child 1 for parent 1",
      userId: 4,
      customerId: 4,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: 10020,
      name: "Finished child 2 for parent 1",
      userId: 4,
      customerId: 4,
      duration: {
        type: "FINISHED",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: null, // id: 10023
      name: "Finished parent project 2",
      userId: 5,
      customerId: 5,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: 10023,
      name: "Finished child 1 for parent 2",
      userId: 5,
      customerId: 5,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: null, // id: 10025
      name: "Finished parent project 3",
      userId: 5,
      customerId: 5,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: 10025,
      name: "Finished child 1 for parent 3",
      userId: 5,
      customerId: 5,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      parentProjectId: 10025,
      name: "Finished child 2 for parent 3",
      userId: 5,
      customerId: 5,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "FINISHED",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      //id: 10028
      name: "Running parent to be finished thru PATCH",
      userId: 6,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "RUNNING_FOLLOWUP",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      //id: 10029
      parentProjectId: 10028,
      name: "Running child 1 to be finished thru parent patch",
      userId: 6,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "ON_HOLD",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      //id: 10030
      parentProjectId: 10028,
      name: "Running child 2 to be finished thru parent patch",
      userId: 6,
      customerId: 1,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1901000011
      },
      status: "RUNNING",
      active: true,
      registrationPoints: [],
      actions: []
    },
    {
      //id: 10031
      name: "Project that cannot be patched because of inactive Product (id 10055)",
      userId: 6767,
      customerId: 6767,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "RUNNING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10052,
          "name": "Beef",
          "oldModelId": 10009
        }, {
          "id": 10053,
          "name": "Hit that beef",
          "oldModelId": 10010
        }
      ],
      actions: []
    },
    {
      //id: 10032
      name: "Project that cannot be patched because of inactive Area (id 10006)",
      userId: 6767,
      customerId: 6767,
      duration: {
        type: "CALENDAR",
        start: 1491000010,
        end: 1491000011
      },
      status: "RUNNING_FOLLOWUP",
      active: true,
      registrationPoints: [
        {
          "id": 10052,
          "name": "Beef",
          "oldModelId": 10009
        }
      ],
      actions: []
    },
    {
      //id: 10033
      name: "Registration points with include children",
      duration: { "end": 1634802400, "type": "CALENDAR", "start": 1535580000 },
      status: "RUNNING",
      registrationPoints: [{
        id: 10000,
        name: "Test",
        includeChildren: true
      },
        {
          id: 10001,
          name: "Kitchen",
          includeChildren: true
        }],
      actions: [],
      userId: 1,
      customerId: 1,
      active: true
    },
    {
      //id: 10034
      name: "NO registrationPoints",
      duration: { "end": 1634802400, "type": "CALENDAR", "start": 1535580000 },
      status: "RUNNING",
      registrationPoints: [],
      actions: [],
      userId: 1,
      customerId: 1,
      active: true
    },
    {
      //id: 10035
      name: "YES registrationPoints",
      duration: { "end": 1534802400, "type": "CALENDAR", "start": 1535580000 },
      status: "RUNNING",
      registrationPoints: [
        {
          "id": 10079,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10059,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10081,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10083,
          "name": "Salmon",
          "oldModelId": 10000
        }, {
          "id": 10080,
          "name": "Salmon",
          "oldModelId": 10000
        }
      ],
      actions: [],
      userId: 1,
      customerId: 1,
      active: true
    },
    {
      id: 284382,
      parentProjectId: 8384,
      name: "No valid parent project id",
      duration: { "end": 1534802400, "type": "CALENDAR", "start": 1535580000 },
      status: "RUNNING",
      registrationPoints: [],
      actions: [],
      userId: 1,
      customerId: 6767,
      active: true
    },
    {
      id: 284383,
      parentProjectId: 284382,
      name: "Has parent project that has a invalid parent project id",
      duration: { "end": 1534802400, "type": "CALENDAR", "start": 1535580000 },
      status: "RUNNING",
      registrationPoints: [],
      actions: [],
      userId: 1,
      customerId: 6767,
      active: true
    },
    {
      id: 284384,
      parentProjectId: 284382,
      name: "Deleted - Has parent project that has a invalid parent project id",
      duration: { "end": 1534802400, "type": "CALENDAR", "start": 1535580000 },
      status: "RUNNING",
      deletedAt: 2838232,
      registrationPoints: [],
      actions: [],
      userId: 1,
      customerId: 6767,
      active: true
    },
    //ID 10036
    {
      "name": "Project Name",
      "duration": {
        "days": 1,
        "type": "REGISTRATIONS",
        "start": 1535932800
      },
      "status": "RUNNING_FOLLOWUP",
      "period": 2,
      "registrationPoints": [
        {
          "id": 10074,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10082,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10055,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10067,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10061,
          "name": "Chicken",
          "oldModelId": 10001
        }
      ],
      "actions": [{
        "id": "10005",
        "name": "Stop cooking bad food",
      },
        {
          "id": "10006",
          "name": "Get a dog",
        }
      ],
      "userId": "1",
      "customerId": "1",
      "createdAt": "2018-09-03 16:46:00.756+00"
    },
    //ID 10037
    {
      "name": "Project Name",
      "parentProjectId": "10036",
      "duration": {
        "days": 1,
        "type": "REGISTRATIONS",
        "start": 1536192000
      },
      "status": "RUNNING",
      "period": 2,
      "registrationPoints": [
        {
          "id": 10074,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10082,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10055,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10067,
          "name": "Chicken",
          "oldModelId": 10001
        }, {
          "id": 10061,
          "name": "Chicken",
          "oldModelId": 10001
        }
      ],
      "actions": [{
        "id": "10005",
        "name": "Stop cooking bad food",
      },
        {
          "id": "10006",
          "name": "Get a dog",
        }],
      "userId": "1",
      "customerId": "1",
      "createdAt": "2018-09-06 16:47:00.756+00"
    }
  ],

  /*
   * REGISTRATIONS
   */
  registration: [
    {
      customerId: 1,
      date: "2017-06-01",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 1,
      date: "2017-06-02",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 1,
      date: "2017-06-03",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 510,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 1,
      date: "2017-06-02",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5283,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2017-06-02",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5283,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 1,
      date: "2016-06-04",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 1,
      date: "2017-10-02",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 2240,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      deletedAt: null,
      registrationPointId: 10058
    },
    {
      customerId: 1,
      date: "2017-10-02",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 9378,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      deletedAt: null,
      registrationPointId: 10058
    },
    {
      customerId: 1,
      date: "2017-06-10",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      deletedAt: null,
      registrationPointId: 10058
    },
    {
      customerId: 2,
      date: "2017-06-01",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10058,
      deletedAt: null
    },
    {
      customerId: 51,
      date: "2017-06-01",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10058,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2017-06-02",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10058,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2017-06-03",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 510,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2017-06-02",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5283,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2017-06-02",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5283,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2016-06-04",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10057,
      deletedAt: null
    },
    {
      customerId: 2,
      date: "2017-10-02",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 2240,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      deletedAt: null,
      registrationPointId: 10058
    },
    {
      customerId: 2,
      date: "2017-10-02",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 9378,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      deletedAt: null,
      registrationPointId: 10058
    },
    {
      customerId: 2,
      date: "2017-06-10",
      userId: 2,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      deletedAt: null,
      registrationPointId: 10058
    },
    {
      date: "2017-02-07",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-08",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-09",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-10",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-11",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-12",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-13",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-14",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000"
    },
    {
      date: "2017-02-14",
      currency: "DKK",
      amount: 35000,
      unit: 'kg',
      manual: true,
      registrationPointId: 10079,
      userId: "11",
      customerId: "11",
      cost: "350000",
      deletedAt: '2017-12-04 10:55:33+00'
    },
    {
      customerId: 1,
      date: "2017-06-01",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10041,
      deletedAt: null
    },
    {
      customerId: 1,
      date: "2017-06-02",
      userId: 1,
      amount: 1800,
      unit: 'kg',
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      registrationPointId: 10042,
      deletedAt: null
    },
    {
      customerId: 32066,
      date: "2017-12-29",
      userId: 1,
      amount: 7000,
      cost: 74200,
      updatedAt: "2017-12-29 20:30:28+00",
      createdAt: "2017-12-29 20:30:28+00",
      registrationPointId: 10057
    },
    {
      customerId: 32066,
      date: "2017-12-29",
      userId: 1,
      amount: 1200,
      cost: 3750,
      updatedAt: "2017-12-29 20:30:28+00",
      createdAt: "2017-12-29 20:30:28+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2017-12-29",
      userId: 1,
      amount: 4300,
      cost: 6390,
      updatedAt: "2017-12-29 20:30:28+00",
      createdAt: "2017-12-29 20:30:28+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2017-12-29",
      userId: 1,
      amount: 3100,
      cost: 26300,
      updatedAt: "2017-12-29 20:30:28+00",
      createdAt: "2017-12-29 20:30:28+00",
      registrationPointId: 10001
    },
    {
      customerId: 33973,
      date: "2017-12-29",
      userId: 1,
      amount: 14100,
      cost: 81075,
      updatedAt: "2017-12-29 20:30:28+00",
      createdAt: "2017-12-29 20:30:28+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2017-12-30",
      userId: 1,
      amount: 400,
      cost: 2509,
      updatedAt: "2017-12-30 06:56:40+00",
      createdAt: "2017-12-30 06:56:40+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2017-12-30",
      userId: 1,
      amount: 8300,
      cost: 49800,
      updatedAt: "2017-12-30 07:08:39+00",
      createdAt: "2017-12-30 07:08:39+00",
      registrationPointId: 10057
    },
    {
      customerId: 32066,
      date: "2017-12-30",
      userId: 1,
      amount: 4000,
      cost: 1234,
      updatedAt: "2017-12-30 07:47:39+00",
      createdAt: "2017-12-30 07:47:39+00",
      registrationPointId: 10057
    },
    {
      customerId: 32066,
      date: "2017-12-30",
      userId: 1,
      amount: 3900,
      cost: 1234,
      updatedAt: "2017-12-30 08:47:39+00",
      createdAt: "2017-12-30 08:47:39+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2017-12-30",
      userId: 1,
      amount: 1500,
      cost: 1234,
      updatedAt: "2017-12-30 09:43:39+00",
      createdAt: "2017-12-30 09:43:39+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2018-01-02",
      userId: 1,
      amount: 4300,
      cost: 1234,
      updatedAt: "2018-01-02 09:43:39+00",
      createdAt: "2018-01-02 09:43:39+00",
      registrationPointId: 10057
    },
    {
      customerId: 33629,
      date: "2018-01-02",
      userId: 1,
      amount: 12300,
      cost: 1234,
      updatedAt: "2018-01-02 10:43:39+00",
      createdAt: "2018-01-02 10:43:39+00",
      registrationPointId: 10057
    },
    {
      customerId: 33973,
      date: "2018-01-02",
      userId: 1,
      amount: 4100,
      cost: 1234,
      updatedAt: "2018-01-04 11:27:39+00",
      createdAt: "2018-01-04 11:27:39+00", // Testing that benchmarks works properly by `date`, even if registration is created later
      registrationPointId: 10057
    },
    {
      customerId: 33973,
      date: "2018-01-02",
      userId: 1,
      amount: 1400,
      cost: 1234,
      updatedAt: "2018-01-06 11:54:39+00",
      createdAt: "2018-01-06 11:54:39+00", // Testing that benchmarks works properly by `date`, even if registration is created later
      registrationPointId: 10057
    },
    {
      customerId: 32066,
      date: "2018-01-02",
      userId: 1,
      amount: 2300,
      cost: 1234,
      updatedAt: "2018-01-06 12:54:39+00",
      createdAt: "2018-01-06 12:54:39+00", // Testing that benchmarks works properly by `date`, even if registration is created later
      registrationPointId: 10057
    },
    // Regs regarding Finished Projects for Benchmarks page
    // parent project 10020
    {
      //id: 10044,
      customerId: 4,
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10045,
      customerId: 4,  // for child project with ID 10021
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10046,
      customerId: 4,  // for child project with ID 10021
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10047,
      customerId: 4,  // for child project with ID 10022
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10048,
      customerId: 4,  // for child project with ID 10022
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    // parent project 10023
    {
      //id: 10049,
      customerId: 5,
      date: "2018-05-14",
      userId: 4,
      amount: 34400,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10050,
      customerId: 5,  // for child project with ID 10024
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    // parent project 10025
    {
      //id: 10051,
      customerId: 5,
      date: "2018-05-14",
      userId: 4,
      amount: 13700,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10052,
      customerId: 5,  // for child project with ID 10026
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10053,
      customerId: 5,  // for child project with ID 10027
      date: "2018-05-14",
      userId: 4,
      amount: 2300,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10054,
      customerId: 5,  // for child project with ID 10027
      date: "2018-05-14",
      userId: 4,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    // regs for frequency calculations --------
    {
      //id: 10055
      customerId: 1,
      date: "2018-06-11",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10056
      customerId: 1,
      date: "2018-06-12",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10057
      customerId: 1,
      date: "2018-06-12",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10058
      customerId: 4,
      date: "2018-06-11",
      userId: 4,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10059
      customerId: 4,
      date: "2018-06-12",
      userId: 4,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10060
      customerId: 5,
      date: "2018-06-15",
      userId: 5,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10061
      customerId: 5,
      date: "2018-06-16",
      userId: 5,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10062
      customerId: 5,
      date: "2018-06-17",
      userId: 5,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057
    },
    {
      //id: 10063,
      customerId: 1,
      date: "2017-04-04",
      userId: 4,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10083
    },
    {
      //id: 10064,
      customerId: 1,
      date: "2017-04-14",
      userId: 4,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10083
    },
    {
      //id: 10065,
      customerId: 1,
      date: "2017-04-24",
      userId: 4,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10083
    },
    {
      //id: 10066,
      customerId: 1,
      date: "2018-09-03",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057,
      "createdAt": "2018-09-03 16:47:00.756+00"
    },
    {
      //id: 10067,
      customerId: 1,
      date: "2018-09-05",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057,
      "createdAt": "2018-09-04 06:47:00.756+00"
    },
    {
      //id: 10068,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10057,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10069,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10061,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10070,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10061,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10071,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10061,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10072,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10070,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10073,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10070,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10074,
      customerId: 1,
      date: "2018-09-10",
      userId: 1,
      amount: 2100,
      cost: 1234,
      registrationPointId: 10070,
      "createdAt": "2018-09-10 16:47:00.756+00"
    },
    {
      //id: 10075,
      customerId: 1,
      date: "2018-07-05",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10057
    },
    {
      //id: 10076,
      customerId: 1,
      date: "2018-07-05",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10070
    },
    {
      //id: 10077,
      customerId: 1,
      date: "2018-07-05",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10071
    },
    {
      //id: 10078,
      customerId: 1,
      date: "2018-07-25",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10057
    },
    {
      //id: 10079,
      customerId: 1,
      date: "2018-07-25",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10070
    },
    {
      //id: 10080,
      customerId: 1,
      date: "2018-07-25",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10071
    },
    {
      //id: 10081,
      customerId: 1,
      date: "2018-08-05",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10057
    },
    {
      //id: 10082,
      customerId: 1,
      date: "2018-08-05",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10070
    },
    {
      //id: 10083,
      customerId: 1,
      date: "2018-08-05",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10071
    },
    {
      //id: 10084,
      customerId: 1,
      date: "2018-08-25",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10057
    },
    {
      //id: 10085,
      customerId: 1,
      date: "2018-08-25",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10070
    },
    {
      //id: 10086,
      customerId: 1,
      date: "2018-08-25",
      userId: 1,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10071
    },
    {
      //id: 10087,
      customerId: 2,
      date: "2018-07-05",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10050
    },
    {
      //id: 10087,
      customerId: 2,
      date: "2018-07-05",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10051
    },
    {
      //id: 10088,
      customerId: 2,
      date: "2018-07-05",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10052
    },
    {
      //id: 10089,
      customerId: 2,
      date: "2018-07-25",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10052
    },
    {
      //id: 10090,
      customerId: 2,
      date: "2018-07-25",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10050
    },
    {
      //id: 10091,
      customerId: 2,
      date: "2018-07-25",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10051
    },
    {
      //id: 10092,
      customerId: 2,
      date: "2018-08-05",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10052
    },
    {
      //id: 10093,
      customerId: 2,
      date: "2018-08-05",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10050
    },
    {
      //id: 10094,
      customerId: 2,
      date: "2018-08-05",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10051
    },
    {
      //id: 10095,
      customerId: 2,
      date: "2018-08-25",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10052
    },
    {
      //id: 10096,
      customerId: 2,
      date: "2018-08-25",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10050
    },
    {
      //id: 10097,
      customerId: 2,
      date: "2018-08-26",
      userId: 2,
      amount: 100000,
      cost: 10000,
      registrationPointId: 10051
    }
  ],
  guestTypes: [
    {
      userId: 1,
      customerId: 2,
      name: "Guest type 1"
    },
    {
      userId: 1,
      customerId: 2,
      name: "Guest type 2"
    }
  ],
  guestRegistrations: [
    {
      userId: 1,
      customerId: 2,
      date: "2017-05-05",
      amount: 315
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-06-01",
      amount: 15
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-06-01",
      amount: 27
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-05-12",
      amount: 45
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-06-10",
      amount: 45
    }
  ],
  /*
   * SALES
   */
  sale: [
    {
      userId: 1,
      customerId: 1,
      date: "2017-05-05",
      income: 8200,
      portions: 431,
      portionPrice: 21222,
      productionCost: 12633,
      productionWeight: 54
    },
    {
      userId: 1,
      customerId: 1,
      date: "2017-06-01",
      income: 19090,
      portions: 25,
      portionPrice: 22010,
      productionCost: 200,
      productionWeight: 74
    },
    {
      userId: 1,
      customerId: 1,
      date: "2017-06-01",
      income: 3920,
      portions: 13,
      portionPrice: 29212,
      productionCost: 10523,
      productionWeight: 14
    },
    {
      userId: 1,
      customerId: 1,
      date: "2017-05-12",
      income: 10000,
      portions: 45,
      portionPrice: 52212,
      productionCost: 15023,
      productionWeight: 14
    },
    {
      userId: 1,
      customerId: 1,
      date: "2017-06-10",
      income: 19420,
      portions: 45,
      portionPrice: 72221,
      productionCost: 15023,
      productionWeight: 14
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-05-05",
      income: 8200,
      portions: 431,
      portionPrice: 21222,
      productionCost: 12633,
      productionWeight: 54
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-06-01",
      income: 19090,
      portions: 25,
      portionPrice: 22010,
      productionCost: 200,
      productionWeight: 74
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-06-01",
      income: 3920,
      portions: 13,
      portionPrice: 29212,
      productionCost: 10523,
      productionWeight: 14
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-05-12",
      income: 10000,
      portions: 45,
      portionPrice: 52212,
      productionCost: 15023,
      productionWeight: 14
    },
    {
      userId: 1,
      customerId: 2,
      date: "2017-06-10",
      income: 19420,
      portions: 45,
      portionPrice: 72221,
      productionCost: 15023,
      productionWeight: 14
    }
  ],
  templates: [{
    name: 'test',
    templateAccountId: 1
  }]
};
