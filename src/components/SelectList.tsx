import React from "react";
import { Custom } from "react-xnft";
import { CSSProperties } from "react";

export interface SelectListProps {
  onChange: (event: Event) => void;
  style?: CSSProperties;
  options: SelectListOption[],
};

export interface SelectListOption {
    label: string;
    value: string;
    selected?: boolean;
}


export const SelectList = (props: SelectListProps) => {
    return (
        <Custom component={"select"} style={props.style} onChange={props.onChange}>
            { props.options.map((o,i)=> (
                <Custom
                    component="option"
                    value={o.value}
                    label={o.label}
                    selected={o.selected}
                    key={`option_${i}`}
                />
            ))
            }
        </Custom>
    );
};


