import { ExtendedGetInfoResponse } from "../types/WebLN";

type NodeStatsProps = {
  nodeInfo: ExtendedGetInfoResponse;
};

export function NodeStats({ nodeInfo }: NodeStatsProps) {
  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Alias</div>
        <div className="stat-value">{nodeInfo.node.alias}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Color</div>
        <div
          className="stat-value drop-shadow"
          style={{ color: nodeInfo.node.color }}
        >
          {nodeInfo.node.color}
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Pubkey</div>
        <div className="stat-value truncate w-48">{nodeInfo.node.pubkey}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Version</div>
        <div className="stat-value">{nodeInfo.version}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Supports</div>
        <div className="stat-value">{nodeInfo.supports}</div>
      </div>
    </div>
  );
}
