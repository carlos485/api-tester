import { useState, Children, isValidElement } from "react";
import type { ReactElement, ReactNode, FC } from "react";

interface TabProps {
  header: string;
  children: ReactNode;
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

type TabVariant = "default" | "pills" | "minimal" | "cards";

interface TabsProps {
  children: ReactNode;
  defaultActiveTab?: number;
  variant?: TabVariant;
}

const tabVariants = {
  default: {
    container: "border-b border-gray-200",
    nav: "-mb-px flex space-x-8",
    tab: "py-2 px-1 border-t-2 border-x-2 rounded-sm font-medium text-sm transition-colors duration-200",
    activeTab: "border-gray-900 text-gray-900",
    inactiveTab:
      "border-transparent text-gray-400 hover:text-gray-500 hover:border-gray-500",
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
};

export const Tabs: FC<TabsProps> = ({
  children,
  defaultActiveTab = 0,
  variant = "default",
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> =>
      isValidElement(child) && child.type === Tab
  );

  const rightElement = Children.toArray(children).find(
    (child): child is ReactElement<TabsRightProps> => 
      isValidElement(child) && child.type === TabsRight
  );

  const styles = tabVariants[variant];

  return (
    <div className="w-full">
      <div className={styles.container}>
        <div className="flex justify-between items-center">
          <nav className={styles.nav}>
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`${styles.tab} ${
                  activeTab === index ? styles.activeTab : styles.inactiveTab
                }`}
              >
                {tab.props.header}
              </button>
            ))}
          </nav>
          {rightElement && (
            <div className="flex items-center">
              {rightElement.props.children}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">{tabs[activeTab]?.props.children}</div>
    </div>
  );
};
