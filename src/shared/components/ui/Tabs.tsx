import { useState, useEffect, useMemo, Children, isValidElement } from "react";
import type { ReactElement, ReactNode, FC } from "react";
import { Icon } from "@iconify/react";

interface TabProps {
  header: string | ReactNode;
  children: ReactNode;
  isTransient?: boolean;
}

export const Tab: FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

interface TabsRightProps {
  children: ReactNode;
}

export const TabsRight: FC<TabsRightProps> = ({ children }) => {
  return <>{children}</>;
};

type TabVariant = "default" | "pills" | "minimal" | "cards" | "underline";

interface TabsProps {
  children: ReactNode;
  defaultActiveTab?: number;
  variant?: TabVariant;
  onAddTab?: () => void;
  onTabChange?: (index: number) => void;
  onCloseTab?: (index: number) => void;
  onTabDoubleClick?: (index: number) => void;
  showCloseButton?: boolean;
}

const tabVariants = {
  default: {
    container: "border-b border-gray-300 dark:border-gray-700",
    nav: "-mb-px flex space-x-8",
    tab: "relative py-2.5 px-3 border-b-2 font-medium text-sm transition-colors duration-200 mr-0 before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px after:content-[''] after:absolute after:right-0 after:top-1 after:bottom-1 after:w-px",
    activeTab: "before:bg-gray-300 after:bg-gray-300 dark:before:bg-gray-700 dark:after:bg-gray-700 border-b-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-80",
    inactiveTab:
      "before:bg-transparent after:bg-transparent border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400",
  },
  pills: {
    container: "bg-gray-100 p-1 rounded-lg",
    nav: "flex space-x-1",
    tab: "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
    activeTab: "bg-white text-gray-900 shadow-sm",
    inactiveTab: "text-gray-500 hover:text-gray-700",
  },
  minimal: {
    container: "",
    nav: "flex space-x-6",
    tab: "py-2 text-sm font-medium transition-colors duration-200",
    activeTab: "text-blue-600",
    inactiveTab: "text-gray-500 hover:text-gray-700",
  },
  cards: {
    container: "border-b border-gray-200",
    nav: "-mb-px flex space-x-2",
    tab: "px-4 py-2 border border-gray-200 rounded-t-lg font-medium text-sm transition-colors duration-200",
    activeTab: "bg-white border-b-white text-gray-900",
    inactiveTab:
      "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  },
  underline: {
    container: "border-b border-gray-200 dark:border-gray-600",
    nav: "flex space-x-8 px-4",
    tab: "py-2 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors duration-200",
    activeTab: "border-gray-900 dark:border-white text-gray-900 dark:text-white",
    inactiveTab:
      "border-transparent text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:border-gray-500",
  },
};

export const Tabs: FC<TabsProps> = ({
  children,
  defaultActiveTab = 0,
  variant = "default",
  onAddTab,
  onTabChange,
  onCloseTab,
  onTabDoubleClick,
  showCloseButton = false,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const tabs = useMemo(() =>
    Children.toArray(children).filter(
      (child): child is ReactElement<TabProps> =>
        isValidElement(child) && child.type === Tab
    ), [children]
  );

  const rightElement = useMemo(() =>
    Children.toArray(children).find(
      (child): child is ReactElement<TabsRightProps> =>
        isValidElement(child) && child.type === TabsRight
    ), [children]
  );

  // Sync with external defaultActiveTab changes
  useEffect(() => {
    // Ensure the active tab index is valid
    const validIndex = Math.max(0, Math.min(defaultActiveTab, tabs.length - 1));
    setActiveTab(validIndex);
  }, [defaultActiveTab, tabs.length]);

  const styles = tabVariants[variant];

  return (
    <div className="w-full h-full flex flex-col">
      <div className={styles.container}>
        <div className="flex justify-between items-center">
          <nav className={styles.nav}>
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={`${styles.tab} ${activeTab === index ? styles.activeTab : styles.inactiveTab
                  } ${showCloseButton ? 'group flex items-center gap-2' : ''} ${tab.props.isTransient ? 'italic opacity-75' : ''
                  }`}
              >
                <button
                  onClick={() => {
                    setActiveTab(index);
                    onTabChange?.(index);
                  }}
                  onDoubleClick={() => onTabDoubleClick?.(index)}
                  className={`${showCloseButton ? 'flex-1 text-left' : 'w-full'}`}
                  title={tab.props.isTransient ? "Tab transitoria - doble clic para fijar" : ""}
                >
                  {tab.props.header}
                </button>
                {showCloseButton && onCloseTab && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm p-0.5 transition-all duration-150"
                    title="Close tab"
                  >
                    <Icon icon="material-symbols:close" className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {onAddTab && (
              <button
                onClick={onAddTab}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                title="Add new tab"
              >
                <Icon icon="material-symbols:add" className="w-4 h-4" />
              </button>
            )}
          </nav>
          {rightElement && (
            <div className="flex items-center">
              {rightElement.props.children}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {tabs[activeTab]?.props.children}
      </div>
    </div>
  );
};
