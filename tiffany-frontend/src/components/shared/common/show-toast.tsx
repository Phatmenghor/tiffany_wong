// utils/toast.ts
import { toast, ToastOptions } from "react-toastify";
import { ModernToastContent } from "./modern-toast";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

interface ToastParams {
  title?: string;
  message: string;
  details?: Record<string, any>;
  duration?: number;
}

interface ValidationParams {
  title?: string;
  message?: string;
  nid: string;
  score: number;
  status: 'SUCCESS' | 'FAILURE';
  incorrectFields?: string[];
  nameKH?: string;
  nameEN?: string;
  dob?: string;
  gender?: string;
  issued?: string;
  expired?: string;
  phoneNumber?: string;
  duration?: number;
}

const getToastTitle = (type: string, customTitle?: string) => {
  if (customTitle) return customTitle;
  switch (type) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Information';
    case 'order':
      return 'Order Update';
    case 'payment':
      return 'Payment Status';
    case 'user':
      return 'User Alert';
    default:
      return 'Notification';
  }
};

export const showToast = {
  success: (params: string | ToastParams) => {
    const { message, title, details, duration } =
      typeof params === 'string' ? { message: params } : params;

    toast.success(
      <ModernToastContent
        type="success"
        title={title || getToastTitle('success')}
        message={message}

        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  error: (params: string | ToastParams) => {
    const { message, title, details, duration } =
      typeof params === 'string' ? { message: params } : params;

    toast.error(
      <ModernToastContent
        type="error"
        title={title || getToastTitle('error')}
        message={message}

        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  warning: (params: string | ToastParams) => {
    const { message, title, details, duration } =
      typeof params === 'string' ? { message: params } : params;

    toast.warning(
      <ModernToastContent
        type="warning"
        title={title || getToastTitle('warning')}
        message={message}

        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  info: (params: string | ToastParams) => {
    const { message, title, details, duration } =
      typeof params === 'string' ? { message: params } : params;

    toast.info(
      <ModernToastContent
        type="info"
        title={title || getToastTitle('info')}
        message={message}

        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  order: (params: ToastParams) => {
    const { message, title, details, duration } = params;

    toast.info(
      <ModernToastContent
        type="order"
        title={title || getToastTitle('order')}
        message={message}
        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  payment: (params: ToastParams) => {
    const { message, title, details, duration } = params;

    toast.info(
      <ModernToastContent
        type="payment"
        title={title || getToastTitle('payment')}
        message={message}
        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  user: (params: ToastParams) => {
    const { message, title, details, duration } = params;

    toast.info(
      <ModernToastContent
        type="user"
        title={title || getToastTitle('user')}
        message={message}
        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },

  validation: (params: ValidationParams) => {
    const {
      title,
      message,
      nid,
      score,
      status,
      incorrectFields,
      nameKH,
      nameEN,
      dob,
      gender,
      issued,
      expired,
      phoneNumber,
      duration,
    } = params;

    const defaultTitle =
      status === 'SUCCESS'
        ? 'NID Validation Successful'
        : 'NID Validation Failed';

    const defaultMessage =
      status === 'SUCCESS'
        ? 'National ID has been validated successfully.'
        : 'National ID validation failed. Please recheck the information.';

    toast[status === 'SUCCESS' ? 'success' : 'warning'](
      <ModernToastContent
        type="validation"
        title={title || defaultTitle}
        message={message || defaultMessage}

        validationData={{
          nid,
          score,
          status,
          incorrectFields,
          nameKH,
          nameEN,
          dob,
          gender,
          issued,
          expired,
          phoneNumber,
        }}
      />,
      { ...defaultOptions, autoClose: duration || 6000 }
    );
  },
};
