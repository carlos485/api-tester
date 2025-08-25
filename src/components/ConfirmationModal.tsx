import { Icon } from "@iconify/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "material-symbols:warning",
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      confirmButton: "text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300",
    },
    warning: {
      icon: "material-symbols:warning",
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      confirmButton: "text-white bg-yellow-600 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300",
    },
    info: {
      icon: "material-symbols:info",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      confirmButton: "text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300",
    },
  };

  const currentStyle = typeStyles[type];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow">
          {/* Modal header */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="material-symbols:close" className="w-3 h-3" />
            <span className="sr-only">Close modal</span>
          </button>

          {/* Modal body */}
          <div className="p-6 text-center">
            <div className={`mx-auto mb-4 w-12 h-12 ${currentStyle.iconBg} rounded-full flex items-center justify-center`}>
              <Icon 
                icon={currentStyle.icon} 
                className={`w-5 h-5 ${currentStyle.iconColor}`} 
              />
            </div>
            
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              {title}
            </h3>
            
            <p className="mb-5 text-sm text-gray-500">
              {message}
            </p>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed ${currentStyle.confirmButton}`}
              >
                {loading && (
                  <Icon 
                    icon="line-md:loading-loop" 
                    className="w-4 h-4 mr-2" 
                  />
                )}
                {confirmText}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;