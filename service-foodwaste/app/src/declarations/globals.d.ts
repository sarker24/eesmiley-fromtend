declare let log: any;
declare module NodeJS {
  interface Global {
    log: any;
  }
}

declare interface PatchOperation {
  op: string;
  path: string;
  value: string | number | boolean;
}

/*
 * Contains from legacy
 */
declare namespace Legacy {
  export interface Response {
    current: LegacyAccount;
    children: LegacyAccount[]
  }

  export interface LegacyAccount {
    dealId: string;
    company: string;
    nickname?: string | null;
  }
}

/*
 * The Settings entity
 */
declare interface Settings {
  id: string;
  customerId: string;
  userId: string;
  current: SettingsNamespace.CurrentSettings;
  updateTime: string;
  createTime: string;
  history: Object;
}

declare namespace SettingsNamespace {
  export interface Account {
    id: number,
    name: string,
    nickname?: string;
    settingsAreSet?: boolean;
  }

  export interface AlarmRecipient {
    name: string;
    type: 'sms' | 'email';
    value: string;
  }

  export interface Alarms {
    zone: string;
    enabled: boolean;
    message: string;
    recipients: AlarmRecipient[];
    executionTime: number
  }

  export interface ExpectedFrequency {
    from: string;
    days: number[];
  }

  export interface ExpectedWaste {
    from: string;
    amount: number;
    unit: 'g' | 'kg' | 'lt';
    period: 'day' | 'week' | 'month' | 'year';
    amountNormalized: number;
  }

  export interface CurrentSettings {
    name: string;
    unit: string;
    sound: any;
    alarms: Alarms;
    accounts: Array<Account>;
    currency: string;
    database: string;
    mandatory: Array<string>;
    lastUpload: string;
    bootstrapData: boolean;
    categoriesHidden: boolean;
    showDeactivatedAreas: boolean;
    registrationsFrequency: any; // days of the week are represented as numbers, where Sunday = 0
    expectedWeeklyWaste: number[];
    expectedFrequency: ExpectedFrequency[];
    expectedFoodwaste: ExpectedWaste[];
    expectedFoodwastePerGuest: ExpectedWaste[];
    perGuestBaseline: ExpectedWaste[];
    perGuestStandard: ExpectedWaste[];
  }

  export interface Settings {
    id: string;
    customerId: string;
    userId: string;
    current: SettingsNamespace.CurrentSettings;
    updateTime: string;
    createTime: string;
    history: Object;
  }
}

declare namespace Projects {
  export interface Project {
    id: string;
    parentProjectId: string;
    name: string;
    duration: ProjectDurationRegistrations | ProjectDurationCalendar;
    status: 'PENDING_START' | 'RUNNING' | 'PENDING_INPUT' | 'PENDING_FOLLOWUP' | 'RUNNING_FOLLOWUP' | 'ON_HOLD' | 'FINISHED';
    areas: Array<any>
    products: Array<any>;
    actions: Array<any>;
    customerId: string;
    userId: string;
    period?: number;
    followUpProjects?: Array<Project>;
    registrations?: Array<any>;
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface ProjectDurationRegistrations {
    days: number;
    type: 'REGISTRATIONS';
  }

  export interface ProjectDurationCalendar {
    type: 'CALENDAR';
    start: number;
    end;
    number;
  }
}

/*
 * The Registration entity
 */
declare interface Registration {
  id: string;
  customerId: string;
  date: string;
  userId: string;
  amount: number;
  unit: 'kg' | 'lt';
  currency: string;
  kgPerLiter: number;
  cost: number;
  updatedAt: string;
  createdAt: string;
  comment: string;
  manual: boolean;
  scale: string;
  areaId: number;
  productId: number;
  deletedAt: string;
}

declare namespace ProjectNamespace {
  export enum DurationType {
    CALENDAR = 'CALENDAR', REGISTRATIONS = 'REGISTRATIONS'
  }

  export enum Status {
    PENDING_START, RUNNING, PENDING_INPUT, PENDING_FOLLOWUP, RUNNING_FOLLOWUP, FINISHED
  }

  export interface Duration {
    start: number;
    end: number;
    type: DurationType;
  }

  export interface Project {
    id: string;
    parentProjectId: string;
    userId: string;
    customerId: string;
    name: string;
    duration: Duration;
    status: Status;
    registrationPoints: any;
    actions: any;
    updatedAt: string;
    createdAt: string;
    active: boolean;
    period: number;
  }
}

declare namespace RegistrationNamespace {
  export enum MeasurementUnitType {
    KG = 'kg', LT = 'lt'
  }

  export interface Registration {
    id: string;
    customerId: string;
    date: string;
    userId: string;
    amount: number;
    unit: MeasurementUnitType;
    currency: string;
    kgPerLiter: number;
    cost: string;
    updatedAt: string;
    createdAt: string;
    comment: string;
    manual: boolean;
    scale: string;
    areaId: string;
    productId: string;
    deletedAt: string;
  }
}

declare interface Area {
  id: number;
  userId: number;
  customerId: number;
  name: string;
  description: string;
  image: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  active: boolean;
  bootstrapKey: string;
}

declare interface Product {
  id: number;
  userId: number;
  customerId: number;
  categoryId: number;
  name: string;
  cost: string | number;
  image: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  active: boolean;
  bootstrapKey: string;
  amount: number;
  costPerKg: number;
  goal?: number;
}

declare interface Category {
  id: number;
  userId: number;
  customerId: number;
  name: string;
  image: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  active: boolean;
  bootstrapKey: string;
}

declare namespace CommonsModule {
  export interface Commons {
    init: any;
    getTranslations: any;
    makeHttpRequest: Promise<any>;
  }
}

declare interface Tree<T> {
  id: number;
  parentId?: number;
  path?: string;
  children?: Array<Tree<T>>
}

declare interface RegistrationPoint extends Tree<RegistrationPoint> {
  userId: number;
  customerId: number;
  name: string;
  cost: string | number;
  image: string;
  updatedAt: string;
  createdAt: string;
  deletedAt: string | null;
  active: boolean;
  bootstrapKey: string;
  amount: number;
  costPerKg: number;
}
