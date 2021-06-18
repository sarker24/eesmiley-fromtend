/**
 * Checks if new guest type flag is changed.
 * If so, we need to run migrations between non-types <-> types or delete
 *
 * This is a temporary solution while we still have the old sales dialog in the client
 *
 * Before hook: CREATE/PATCH
 *
 **/
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'process-guest-type-flag';

const GuestTypeMigrationOps = Object.freeze({
  delete: 'delete',
  nullify: 'nullify',
  useDefault: 'useDefault'
});

interface GuestTypeSettings {
  enabled: boolean;
  migrationStrategy: {
    op: 'delete' | 'nullify' | 'useDefault',
    value?: 'string' | 'integer'
  };
}

export async function migrateFromTypes(hook) {
  const sequelize = hook.app.get('sequelize');
  const { customerId, userId } = hook.data;
  const createQuery: string = 'INSERT INTO guest_registration (date, amount, customer_id, user_id) ' +
    '(SELECT date, sum(amount), customer_id, user_id FROM guest_registration ' +
    'WHERE customer_id =:customerId AND user_id =:userId AND deleted_at IS NULL AND guest_type_id IS NOT NULL ' +
    'GROUP BY date, customer_id, user_id)';

  try {
    await sequelize.transaction(async tx => {
      await sequelize.query(createQuery, {
        raw: true,
        replacements: { customerId, userId },
      }, { transaction: tx });

      await sequelize.models.guest_registration.destroy({
        where: {
          customerId,
          guestTypeId: { $ne: null }
        }
      }, { transaction: tx });

    });
  } catch (error) {
    throw new errors.GeneralError('Could not process guest registrations with guest types, unexpected error occurred', {
      errorCode: 500,
      customerId,
      userId,
      subModule,
      error
    });
  }

  return hook;
}

export async function migrateToTypes(hook) {
  const sequelize = hook.app.get('sequelize');
  const settingsKey = hook.method === 'create' ? 'settings' : 'current';
  const { customerId, [settingsKey]: settings } = hook.data;
  const { guestTypes }: { guestTypes: GuestTypeSettings } = settings;

  const { migrationStrategy: { value: defaultTypeId } } = guestTypes;
  const { requestId, sessionId } = hook.params;

  const guestType = await sequelize.models.guest_type.findOne({
    raw: true,
    where: {
      customerId,
      id: defaultTypeId
    }
  });

  if (!guestType) {
    throw new errors.NotFound(`Could not process guest registrations: Guest type with id ${defaultTypeId} does not exist`, {
      requestId,
      sessionId,
      subModule
    });
  }

  await sequelize.models.guest_registration.update({ guestTypeId: guestType.id }, {
    where: {
      customerId
    }
  });

  return hook;

}

export async function deleteOldRecords(hook) {
  const sequelize = hook.app.get('sequelize');
  const { customerId } = hook.data;

  await sequelize.models.guest_registration.destroy({
    where: {
      customerId
    }
  });

  return hook;
}

export default (): Hook => {
  return async (hook: HookContext & { guestsMigrated: boolean }) => {
    const { requestId, sessionId } = hook.params;
    const settingsKey = hook.method === 'create' ? 'settings' : 'current';
    const { [settingsKey]: settingsData, history = {} } = hook.data;
    const { guestTypes }: { guestTypes: GuestTypeSettings } = settingsData;

    const historyKeysDesc = Object.keys(history).map(timestamp => parseInt(timestamp)).sort((a, b) => b - a);
    const prevSettings = historyKeysDesc.length > 1 ? history[historyKeysDesc[1]].settings : null;

    if (!guestTypes) {
      return hook;
    }

    if (prevSettings && prevSettings.guestTypes && prevSettings.guestTypes.enabled === guestTypes.enabled) {
      return hook;
    }

    try {
      const { migrationStrategy: { op } } = guestTypes;
      if (op === GuestTypeMigrationOps.delete) {
        return await deleteOldRecords(hook);
      } else if (op == GuestTypeMigrationOps.useDefault) {
        return await migrateToTypes(hook);
      } else if (op === GuestTypeMigrationOps.nullify) {
        return await migrateFromTypes(hook);
      }
    } catch (error) {
      if (error.data && error.data.errorCode) {
        throw error;
      } else {
        throw new errors.GeneralError('Could not finish the request, unexpected error occurred', {
          error,
          errorCode: 500,
          requestId,
          sessionId,
          subModule
        });
      }
    }
  };
};
