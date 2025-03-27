import { useMemo } from 'react';

import { _customerList } from 'src/_mock/_customer';

// ----------------------------------------------------------------------

export function useCustomer(id) {
  const customer = useMemo(() => {
    if (id) {
      return _customerList.find((customer) => customer.id === id);
    }

    return _customerList[0];
  }, [id]);

  return { customer };
}
