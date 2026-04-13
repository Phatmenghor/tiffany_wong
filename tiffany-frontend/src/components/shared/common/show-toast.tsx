// utils/toast.ts
import { toast, ToastOptions } from "react-toastify";
import { ModernToastContent } from "./modern-toast";
import { v4 as uuidv4 } from 'uuid';

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
        id={uuidv4()}
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
        id={uuidv4()}
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
        id={uuidv4()}
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
        id={uuidv4()}
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
        id={uuidv4()}
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
        id={uuidv4()}
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
        id={uuidv4()}
        details={details}
      />,
      { ...defaultOptions, autoClose: duration || 5000 }
    );
  },
};
