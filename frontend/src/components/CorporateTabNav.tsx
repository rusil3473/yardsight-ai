import React from 'react';
import type { TabId } from './CorporateNavbar';

export type { TabId };

interface CorporateTabNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

/**
 * CorporateTabNav is now seamlessly integrated into the unified CorporateNavbar.
 * This component is maintained for backwards compatibility.
 */
export const CorporateTabNav: React.FC<CorporateTabNavProps> = () => {
  return null;
};

export default CorporateTabNav;
