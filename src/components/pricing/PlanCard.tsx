import React from "react";
import { Button } from "../ui/button";

export interface PlanCardAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  disabled?: boolean;
}

interface PlanCardProps {
  title: string;
  description: string;
  price?: string;
  features: string[];
  primaryAction: PlanCardAction;
  secondaryAction?: PlanCardAction;
  highlight?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  price,
  features,
  primaryAction,
  secondaryAction,
  highlight,
}) => {
  return (
    <div
      className={
        "border rounded-lg p-6 shadow-sm " + (highlight ? "border-primary" : "")
      }
    >
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {price ? <div className="text-2xl font-bold mb-4">{price}</div> : null}
      <ul className="text-sm space-y-1 mb-6">
        {features.map((f, i) => (
          <li key={i}>• {f}</li>
        ))}
      </ul>
      <div className={secondaryAction ? "flex gap-2" : "block"}>
        <Button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className={secondaryAction ? "flex-1" : "w-full"}
          variant={primaryAction.variant || "default"}
        >
          {primaryAction.label}
        </Button>
        {secondaryAction ? (
          <Button
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            className="flex-1"
            variant={secondaryAction.variant || "secondary"}
          >
            {secondaryAction.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default PlanCard;



