import React from "react";
import Buttons from "../../../components/Buttons";

const OutreachHeader = ({ title, onReachOut }) => {
  return (
    <div className="outreach-header">
      <div className="outreach-header-content">
        <h3 className="outreach-title">{title}</h3>
        <div className="outreach-actions">
          <Buttons onClick={onReachOut} variant="primary" size="medium">
            Reach Out
          </Buttons>
        </div>
      </div>
    </div>
  );
};

export default OutreachHeader;
