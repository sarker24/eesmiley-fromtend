import * as React from 'react';
import { DataStorage, DataTransfer } from 'frontend-core';
import { AxiosResponse } from 'axios';
import { Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Spinner } from 'LoadingPlaceholder';
import { makeStyles } from '@material-ui/core/styles';

const store = new DataStorage();
const transfer = new DataTransfer();

export type BootstrapTemplate = {
  id: number;
  name: string;
};

const useStyles = makeStyles({
  root: {
    width: '100%'
  }
});

export interface BootstrapSelectorProps {
  onChange: (template: BootstrapTemplate) => void;
  selected?: number;
}

type OwnProps = BootstrapSelectorProps & InjectedIntlProps;

const BootstrapSelector: React.FunctionComponent<OwnProps> = (props) => {
  const { intl, onChange, selected = '' } = props;
  const classes = useStyles(props);
  const [templates, setTemplates] = React.useState<BootstrapTemplate[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchTemplates = async (): Promise<void> => {
      setLoading(true);

      const token = store.getData('token') as string;
      // eslint-disable-next-line
      transfer.library.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = (await transfer.get('/foodwaste/templates')) as AxiosResponse<
        BootstrapTemplate[]
      >;
      setTemplates(response.data);
      setLoading(false);
    };

    void fetchTemplates();
  }, []);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const templateId = parseInt(event.target.value);
    onChange(templates.find((template) => template.id === templateId));
  };

  return loading ? (
    <Spinner />
  ) : (
    <FormControl className={classes.root}>
      <InputLabel id='bootstrap-selector-label'>
        {intl.messages['base.account_template']}
      </InputLabel>
      <Select value={selected} onChange={handleSelect} labelId='bootstrap-selector-label'>
        {templates.map((template) => (
          <MenuItem key={template.id} value={template.id}>
            {intl.messages[`templates.${template.name}`]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default injectIntl(BootstrapSelector);
