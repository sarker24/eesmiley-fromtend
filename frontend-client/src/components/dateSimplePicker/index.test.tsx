import * as React from 'react';
import { mount } from 'test-utils';
import SimpleDatePicker from './index';
import moment from 'moment';

describe('SimpleDatePicker component', () => {
  it('should render', () => {
    const date = moment();
    const wrapper = mount(
      <SimpleDatePicker
        currentDate={date}
        range={false}
        changeMonthHandler={() => {
          /* no op */
        }}
        changeDayHandler={() => {
          /* no op*/
        }}
        dayClassObjectFunction={(dayReceived) => {
          const selectedDay = moment(dayReceived).startOf('day');
          const selectedDate = moment(date).startOf('day');

          return {
            selectedDate: moment(selectedDay).diff(selectedDate) === 0,
            sale: true
          };
        }}
      />
    );

    const SimpleDatePickerItem = wrapper.find('SimpleDatePicker');
    expect(SimpleDatePickerItem).toHaveLength(1);

    wrapper.find('.simpleCalendarHeader').hostNodes().last().simulate('click');
    wrapper.find('.simpleCalendarHeader').hostNodes().first().simulate('click');
  });

  it('should render with a date in the past', () => {
    const date = moment().subtract(3, 'week');
    const wrapper = mount(
      <SimpleDatePicker
        currentDate={date}
        range={false}
        changeMonthHandler={() => {
          /* no op */
        }}
        changeDayHandler={() => {
          /* no op*/
        }}
        dayClassObjectFunction={(dayReceived) => {
          const selectedDay = moment(dayReceived).startOf('day');
          const selectedDate = moment(date).startOf('day');

          return {
            selectedDate: moment(selectedDay).diff(selectedDate) === 0,
            sale: true
          };
        }}
      />
    );

    const SimpleDatePickerItem = wrapper.find('SimpleDatePicker');

    expect(SimpleDatePickerItem).toHaveLength(1);
  });

  it('should render with a date in the past', () => {
    const date = moment().add(3, 'week').add(2, 'year');
    const wrapper = mount(
      <SimpleDatePicker
        currentDate={date}
        range={false}
        changeMonthHandler={() => {
          /*  no op */
        }}
        changeDayHandler={() => {
          /* no op */
        }}
        dayClassObjectFunction={(dayReceived) => {
          const selectedDay = moment(dayReceived).startOf('day');
          const selectedDate = moment(date).startOf('day');

          return {
            selectedDate: moment(selectedDay).diff(selectedDate) === 0,
            sale: true
          };
        }}
      />
    );

    const SimpleDatePickerItem = wrapper.find('SimpleDatePicker');

    expect(SimpleDatePickerItem).toHaveLength(1);
  });
});
