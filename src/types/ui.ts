export interface ToastConfig {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onPress?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface ModalAction {
  text: string;
  onPress: () => void;
  variant?: 'outline' | 'ghost' | 'white' | 'primary' | 'secondary' | 'danger';
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  actions?: ModalAction[];
}
