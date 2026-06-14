import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import {
  selectCustomersState,
  selectCustomers,
  selectCustomersContent,
  selectCustomersFilters,
  selectCustomersOperations,
  selectCustomersPagination,
  selectCustomersIsLoading,
  selectCustomersError,
} from "../selectors/customers-selectors";

export const useCustomersState = () => {
  const dispatch = useAppDispatch();

  const customerState = useAppSelector(selectCustomersState);
  const customersData = useAppSelector(selectCustomers);
  const customersContent = useAppSelector(selectCustomersContent);
  const filters = useAppSelector(selectCustomersFilters);
  const operations = useAppSelector(selectCustomersOperations);
  const pagination = useAppSelector(selectCustomersPagination);
  const isLoading = useAppSelector(selectCustomersIsLoading);
  const error = useAppSelector(selectCustomersError);

  return {
    customerState,
    customersData,
    customersContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
