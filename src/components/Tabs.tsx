import { useState, Children, isValidElement } from "react";
import type { ReactElement, ReactNode, FC } from "react";

interface TabProps {
  header: string;
  children: ReactNode;
}

export const Tab: FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

interface TabsProps {
  children: ReactElement<TabProps>[];
  defaultActiveTab?: number;
}

export const Tabs: FC<TabsProps> = ({
  children,
  defaultActiveTab = 0,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> =>
      isValidElement(child) && child.type === Tab
  );

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === index
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-500 hover:border-gray-500"
              }`}
            >
              {tab.props.header}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">{tabs[activeTab]?.props.children}</div>
    </div>
  );
};
