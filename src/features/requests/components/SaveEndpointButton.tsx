import { Icon } from "@iconify/react";

interface SaveEndpointButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isSaving?: boolean;
  hasEndpoint?: boolean;
}

const SaveEndpointButton: React.FC<SaveEndpointButtonProps> = ({
  onClick,
  disabled = false,
  isSaving = false,
  hasEndpoint = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center p-2 text-green-500 rounded-lg hover:text-white hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 dark:text-green-400 dark:hover:bg-green-600 dark:focus:ring-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={hasEndpoint ? "Update endpoint" : "Save as new endpoint"}
    >
      <Icon icon={isSaving ? "line-md:loading-loop" : "uil:save"} className="w-5 h-5" />
    </button>
  );
};

export default SaveEndpointButton;
